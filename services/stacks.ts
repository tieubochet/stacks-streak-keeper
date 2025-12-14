import { userSession, CONTRACT_ADDRESS, CONTRACT_NAME } from '../constants';
// Mặc định dùng Testnet để dev. Khi deploy thật thì đổi sang StacksMainnet
import { StacksMainnet, StacksTestnet } from '@stacks/network';
import { 
  callReadOnlyFunction, 
  standardPrincipalCV, 
  ClarityType,
  PostConditionMode // Cần thiết để cho phép ví nhận NFT tự động
} from '@stacks/transactions';
import { openContractCall } from '@stacks/connect';
import { UserStats, LeaderboardEntry } from '../types';

// CẤU HÌNH MẠNG: Đổi thành "new StacksMainnet()" khi chạy chính thức
const getNetwork = () => new StacksMainnet(); 

/**
 * Lấy thông tin chỉ số người dùng (Streak, Max Streak, Total Checkins)
 */
export const fetchUserStats = async (address: string): Promise<UserStats | null> => {
  const network = getNetwork();

  try {
    const result = await callReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-user',
      functionArgs: [standardPrincipalCV(address)],
      senderAddress: address,
      network,
    });

    // Trường hợp user chưa từng chơi: Trả về null hoặc object rỗng
    if (result.type === ClarityType.OptionalNone) {
      return { currentStreak: 0, maxStreak: 0, totalCheckins: 0 };
    }

    // Trường hợp có dữ liệu
    if (result.type === ClarityType.OptionalSome && result.value.type === ClarityType.Tuple) {
      const tupleData = (result.value as any).data;

      const getNum = (cv: any) => {
        if (cv && cv.type === ClarityType.UInt) {
          return Number(cv.value);
        }
        return 0;
      };

      return {
        currentStreak: getNum(tupleData['current-streak']),
        maxStreak: getNum(tupleData['max-streak']),
        totalCheckins: getNum(tupleData['total-checkins']),
      };
    }

    return null;

  } catch (error) {
    console.error(`Error fetching user stats for ${address}:`, error);
    return null;
  }
};

/**
 * Kiểm tra số dư NFT (SIP-009)
 */
export const fetchNftBalance = async (address: string): Promise<number> => {
  const network = getNetwork();
  try {
    const result = await callReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-balance', 
      functionArgs: [standardPrincipalCV(address)],
      senderAddress: address,
      network,
    });
    
    if (result.type === ClarityType.ResponseOk && result.value.type === ClarityType.UInt) {
      return Number(result.value.value);
    }
    return 0;
  } catch (e) {
    console.warn("Lỗi khi check balance NFT:", e);
    return 0;
  }
};

/**
 * Lấy dữ liệu Bảng xếp hạng (Leaderboard)
 */
export const fetchLeaderboardData = async (
  candidateAddresses: string[], 
  currentUserAddress: string | null
): Promise<LeaderboardEntry[]> => {
  
  const allAddresses = new Set(candidateAddresses);
  if (currentUserAddress) allAddresses.add(currentUserAddress);
  
  const promises = Array.from(allAddresses).map(async (addr) => {
    const stats = await fetchUserStats(addr);
    if (stats) {
      return {
        address: addr,
        streak: stats.currentStreak,
        total: stats.totalCheckins,
        isCurrentUser: addr === currentUserAddress,
        rank: 0
      };
    }
    return null;
  });

  const results = await Promise.all(promises);
  const validResults = results.filter((r): r is LeaderboardEntry => r !== null);
  
  // Sắp xếp: Ưu tiên Streak cao -> Sau đó đến Tổng checkin
  validResults.sort((a, b) => {
    if (b.streak !== a.streak) return b.streak - a.streak;
    return b.total - a.total;
  });

  return validResults.map((entry, index) => ({
    ...entry,
    rank: index + 1
  }));
};

/**
 * Thực hiện Check-In
 * Hàm này sẽ tự động Mint NFT nếu user đạt streak 7
 */
export const performCheckIn = async (onFinish: (data: any) => void, onCancel: () => void) => {
  const network = getNetwork();
  
  await openContractCall({
    network,
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: 'check-in',
    functionArgs: [], 
    // QUAN TRỌNG: Allow mode để contract có quyền gửi NFT vào ví bạn
    postConditionMode: PostConditionMode.Allow, 
    onFinish,
    onCancel,
    appDetails: {
      name: 'StreakProtocol',
      icon: window.location.origin + '/favicon.ico', 
    },
  });
};

/**
 * Các hàm xác thực User
 */
export const authenticate = () => {
  userSession.handlePendingSignIn().then(() => {
    window.location.reload();
  }).catch(() => {});
};

export const getUserAddress = (): string | null => {
  if (userSession.isUserSignedIn()) {
    try {
      return userSession.loadUserData().profile.stxAddress.mainnet; // Hoặc testnet tùy config ví
    } catch (e) {
      return null;
    }
  }
  return null;
};