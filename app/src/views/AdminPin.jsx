import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import { verifyPin, getConfig, setConfig, hashPin } from '../services/firebase';

export default function AdminPin() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isSetup, setIsSetup] = useState(null);
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState('enter'); // 'enter' | 'confirm'
  const { isAuthenticated, setIsAuthenticated } = useAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/orders', { replace: true });
      return;
    }
    getConfig().then((cfg) => {
      setIsSetup(!!cfg?.adminPin);
    });
  }, [isAuthenticated, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (isSetup === false) {
      // First-time setup
      if (step === 'enter') {
        if (pin.length < 4) {
          setError('PIN must be at least 4 digits');
          return;
        }
        setConfirmPin(pin);
        setPin('');
        setStep('confirm');
        return;
      }
      if (pin !== confirmPin) {
        setError("PINs don't match. Try again.");
        setPin('');
        setStep('enter');
        return;
      }
      const hashed = await hashPin(pin);
      await setConfig({ adminPin: hashed });
      setIsAuthenticated(true);
      navigate('/admin/orders', { replace: true });
      return;
    }

    const valid = await verifyPin(pin);
    if (valid) {
      setIsAuthenticated(true);
      navigate('/admin/orders', { replace: true });
    } else {
      setError('Wrong PIN');
      setPin('');
    }
  }

  if (isSetup === null) return <div className="loading">Loading...</div>;

  return (
    <form className="pin-screen" onSubmit={handleSubmit}>
      <h1>{isSetup ? 'Admin Access' : (step === 'confirm' ? 'Confirm PIN' : 'Set Admin PIN')}</h1>
      {error && <div className="pin-error">{error}</div>}
      <input
        className="pin-input"
        type="password"
        inputMode="numeric"
        pattern="[0-9]*"
        value={pin}
        onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
        placeholder="····"
        autoFocus
        maxLength={8}
      />
      <button className="btn btn-primary btn-lg" type="submit">
        {isSetup ? 'Enter' : (step === 'confirm' ? 'Confirm' : 'Set PIN')}
      </button>
    </form>
  );
}
