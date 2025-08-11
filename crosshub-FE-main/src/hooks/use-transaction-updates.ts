import { useEffect, useRef, useState, useCallback } from "react";
import { useQueries } from "@tanstack/react-query";
import { queries } from "@/queries";

interface TransactionCount {
  contractAddress: string;
  count: number;
  timestamp: number;
}

interface UseTransactionUpdatesProps {
  /** 모니터링할 컨트랙트 주소 배열 */
  contractAddresses: string[];
  /** 폴링 간격 (밀리초) */
  pollingInterval?: number;
  /** 트랜잭션 증가 시 호출될 콜백 */
  onTransactionIncrease?: (contractAddress: string, newCount: number, previousCount: number) => void;
}

/**
 * 각 컨트랙트별 트랜잭션 개수 변화를 감지하는 커스텀 훅
 */
const useTransactionUpdates = ({
  contractAddresses,
  pollingInterval = 5000, // 5초마다 폴링
  onTransactionIncrease,
}: UseTransactionUpdatesProps) => {
  // 각 컨트랙트별 이전 트랜잭션 개수를 저장
  const previousCounts = useRef<Map<string, number>>(new Map());
  // 각 컨트랙트별 마지막 트랜잭션 증가 시점을 저장
  const [lastUpdateTimes, setLastUpdateTimes] = useState<Map<string, number>>(new Map());

  // 모든 컨트랙트의 통계를 동시에 조회
  const statsQueries = useQueries({
    queries: contractAddresses.map(address => ({
      ...queries.txs.stats(address),
      refetchInterval: pollingInterval,
      staleTime: 0, // 항상 fresh 데이터를 요청
      gcTime: 0, // 캐시하지 않음
    }))
  });

  // 트랜잭션 증가 감지 및 콜백 실행
  useEffect(() => {
    statsQueries.forEach((queryResult, index) => {
      const address = contractAddresses[index];
      const { data: statsResult } = queryResult;
      
      if (statsResult?.success) {
        const currentCount = statsResult.value.currentContractTxCount;
        const previousCount = previousCounts.current.get(address);

        // 이전 값이 있고, 현재 값이 더 클 때만 증가로 판단
        if (previousCount !== undefined && currentCount > previousCount) {
          console.log(`🔥 트랜잭션 증가 감지! Contract: ${address}, ${previousCount} → ${currentCount}`);
          
          // 콜백 실행
          onTransactionIncrease?.(address, currentCount, previousCount);
          
          // 현재 시간을 타임스탬프로 저장
          const currentTime = Date.now();
          setLastUpdateTimes(prev => new Map(prev).set(address, currentTime));
        }

        // 현재 카운트를 이전 값으로 저장
        previousCounts.current.set(address, currentCount);
      }
    });
  }, [statsQueries, contractAddresses, onTransactionIncrease]);

  // 표시등 자동 비활성화를 위한 주기적 상태 업데이트
  useEffect(() => {
    const interval = setInterval(() => {
      // 만료된 표시등들을 제거하여 리렌더링 트리거
      setLastUpdateTimes(prevTimes => {
        const currentTime = Date.now();
        const newTimes = new Map(prevTimes);
        let hasChanges = false;

        for (const [address, timestamp] of newTimes.entries()) {
          if (currentTime - timestamp >= 5000) {
            newTimes.delete(address);
            hasChanges = true;
            console.log(`🔴 ${address} 표시등 자동 비활성화`);
          }
        }

        return hasChanges ? newTimes : prevTimes;
      });
    }, 1000); // 1초마다 체크

    return () => clearInterval(interval);
  }, []);

  // 특정 컨트랙트의 표시등이 활성화되어 있는지 확인하는 함수
  const isIndicatorActive = useCallback((contractAddress: string) => {
    const lastUpdateTime = lastUpdateTimes.get(contractAddress);
    if (!lastUpdateTime) return false;
    
    const currentTime = Date.now();
    const timeDifference = currentTime - lastUpdateTime;
    
    // 5초(5000ms) 이내면 활성화 상태로 간주
    return timeDifference < 5000;
  }, [lastUpdateTimes]);

  // 현재 각 컨트랙트의 트랜잭션 개수 반환
  const getTransactionCounts = useCallback(() => {
    const counts: TransactionCount[] = [];
    
    statsQueries.forEach((queryResult, index) => {
      const address = contractAddresses[index];
      if (queryResult.data?.success) {
        counts.push({
          contractAddress: address,
          count: queryResult.data.value.currentContractTxCount,
          timestamp: Date.now(),
        });
      }
    });
    
    return counts;
  }, [statsQueries, contractAddresses]);

  return {
    isIndicatorActive,
    getTransactionCounts,
    lastUpdateTimes,
    // 각 쿼리의 로딩/에러 상태
    isLoading: statsQueries.some(q => q.isLoading),
    errors: statsQueries.map(q => q.error).filter(Boolean),
  };
};

export { useTransactionUpdates };