import { useState } from 'react';
import BookingSystem from './components/booking/BookingSystem';
import CancelFail from './components/dialogs/CancelFail';
import CancelSuccess from './components/dialogs/CancelSuccess';
import MainBook from './components/main/MainBook';
import AppWrapper from './components/wrapper/AppWrapper';
import { updateBookedTimes } from './utils/utils';

type ViewType = 'main' | 'new' | 'update' | 'cancel';

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('main');
  const [confirmationNumber, setConfirmationNumber] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showCancellation, setShowCancellation] = useState(false);
  const [showCancellationError, setShowCancellationError] = useState(false);
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [retryAction, setRetryAction] = useState<'update' | 'cancel' | undefined>();
  const [cancellationErrorSource, setCancellationErrorSource] = useState<{ errorSource?: string; view?: string }>({});
  const [prefillData, setPrefillData] = useState<any>(null);

  const handleBackToMain = () => {
    setCurrentView('main');
    setConfirmationNumber(null);
    setIsUpdating(false);
    setShowCancellation(false);
    setShowCancellationError(false);
    setShowConfirmationDialog(false);
    setRetryAction(undefined);
    setCancellationErrorSource({});
    setPrefillData(null);
  };

  const updatePeopleData = async () => {
    try {
      const updatedPeopleData = await updateBookedTimes();
      console.log('Updated People Data:', updatedPeopleData);
    } catch (error) {
      console.error('Error updating booked times:', error);
    }
  }

  const handleNewBooking = () => {
    setCurrentView('new');
    // get current booked date/times
    updatePeopleData()
    setIsUpdating(false);
  };

  const handleUpdateBooking = (confirmation: string, appointmentData?: any) => {
    setConfirmationNumber(confirmation);
    setCurrentView('update');
    setIsUpdating(true);
    if (appointmentData) {
      setPrefillData(appointmentData);
    }
  };
  
  const handleCancellationResult = (success: boolean, errorSource?: string, view?: string, confirmNumber?: string) => {
    if (success) {
      if (view === 'update') {
        setConfirmationNumber(confirmNumber || null);
        setCurrentView('update');
        setIsUpdating(true);
      } else {
        setConfirmationNumber(confirmNumber || null);
        setShowCancellation(true);
      }
    } else {
      setCancellationErrorSource({ errorSource, view });
      setShowCancellationError(true);
      setConfirmationNumber(confirmNumber || null);
    }
  };

  const handleTryAgain = () => {
    // Preserve the action type from the error source
    const actionType = cancellationErrorSource.view?.includes('update') ? 'update' : 'cancel';
    setRetryAction(actionType);
    setShowCancellationError(false);
    setShowConfirmationDialog(true);
  };

  return (
    <AppWrapper>
      {currentView === 'main' && (
        <MainBook
          onNewBooking={handleNewBooking}
          onUpdateBooking={handleUpdateBooking}
          onCancellationResult={handleCancellationResult}
          showConfirmationDialog={showConfirmationDialog}
          onCloseConfirmationDialog={() => {
            setShowConfirmationDialog(false);
            setRetryAction(undefined);
          }}
          retryAction={retryAction}
        />
      )}

    {(currentView === 'new' || currentView === 'update') && (
        <BookingSystem
          isUpdating={isUpdating}
          setView={() => setCurrentView('main')}
          confirmationNumber={confirmationNumber}
          setConfirmationNumber={setConfirmationNumber}
          onCancel={handleBackToMain}
          prefillData={prefillData}
        />
      )}

      <CancelSuccess
        open={showCancellation}
        onClose={handleBackToMain}
        confirmationNumber={confirmationNumber || ''}
      />

      <CancelFail
        open={showCancellationError}
        onClose={handleBackToMain}
        onTryAgain={handleTryAgain}
        cancellationErrorSource={cancellationErrorSource}
        confirmationNumber={confirmationNumber || ''}
      />
    </AppWrapper>
  );
}

export default App;