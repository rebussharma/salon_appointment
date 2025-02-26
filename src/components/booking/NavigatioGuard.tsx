import { useEffect } from 'react';

const NavigationGuard = () => {
 let message = "Are you sure you want to leave? Changes you made may not be saved."
  useEffect(() => {
    // Handle page reload/close
    const handleBeforeUnload = (e:any) => {
      e.preventDefault();
      e.returnValue = message;
      return message;
    };
    // Add event listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Push initial state to enable popstate handling
    window.history.pushState(null, '', window.location.href);

    // Cleanup event listeners on unmount
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [message]);

  // This component doesn't render anything
  return null;
};

export default NavigationGuard