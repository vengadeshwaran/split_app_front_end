import React, { useState } from 'react';
import { useIdleTimer } from "react-idle-timer";
import { useSelector } from 'react-redux';


const useIdle = () => {
    const [isIdle, setIsIdle] = useState(false);
    const { userIdleLogout } = useSelector((state) => state?.user);
    const handleOnIdle = () => {
        setIsIdle(true);
    }
    
    const DEFAULT_IDLE_TIMEOUT_MS = 24 * 60 * 60 * 1000;
    const { getRemainingTime, getLastActiveTime } = useIdleTimer({
        timeout: userIdleLogout ? userIdleLogout * 60 * 1000 : DEFAULT_IDLE_TIMEOUT_MS,
        onIdle: handleOnIdle,
        throttle: 500
    })
    
    return {
        getRemainingTime,
        getLastActiveTime,
        isIdle,
    };
}

export default useIdle