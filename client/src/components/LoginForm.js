// src/components/LoginForm.js
import React, { useState } from 'react';
import {
  Modal,
  Box,
  TextField,
  Button,
  Typography,
  Snackbar,
  Alert,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { API_URL } from './config';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 360,
  bgcolor: 'rgba(227, 242, 253, 0.95)',   // Açık mavi arka fon
  boxShadow: 24,
  p: 3,
  borderRadius: '12px',                   // Daha yumuşak köşeler
  border: '1px solid #90caf9',            // Hafif mavi çerçeve
};

const LoginForm = ({ open, handleClose, onLoginSuccess }) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [alert, setAlert] = useState({ open: false, severity: 'info', msg: '' });

  const handleLogin = async () => {
    if (!email || !password) {
      setAlert({ open: true, severity: 'warning', msg: t('login_missing_fields') });
      return;
    }
    try {
      const { data } = await axios.post(`${API_URL}/login`, { email, password });

      if (data.success) {
        onLoginSuccess(data.token, data.role, data.username);
        handleClose();
      } else {
        // Artık doğrudan server'dan gelen message'ı kullanıyoruz:
        const severity = data.code === 'login_inactive' ? 'warning' : 'error';
        setAlert({ open: true, severity, msg: data.message });
      }
    } catch (err) {
      console.error('Giriş hatası:', err);
      // Server'dan JSON gelmemişse yine message varsa göster:
      const serverMsg = err.response?.data?.message;
      setAlert({ open: true, severity: 'error', msg: serverMsg || t('login_error') });
    }
  };

  return (
    <>
      <Modal open={open} onClose={handleClose}>
        <Box sx={style}>
          {/* Kapatma ikonu */}
          <IconButton
            onClick={handleClose}
            sx={{ position: 'absolute', top: 8, right: 8, color: '#1565c0' }}
          >
            <CloseIcon />
          </IconButton>

          <Typography variant="h6" gutterBottom color="primary">
            {t('login_form_title')}
          </Typography>

          {alert.open && (
            <Alert
              severity={alert.severity}
              onClose={() => setAlert(a => ({ ...a, open: false }))}
              sx={{ mb: 2 }}
            >
              {alert.msg}
            </Alert>
          )}

          <TextField
            fullWidth
            label={t('login_email')}
            type="email"
            margin="normal"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <TextField
            fullWidth
            label={t('login_password')}
            type="password"
            margin="normal"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleLogin}
              sx={{
                textTransform: 'none',
                borderRadius: '8px',
                px: 3,
                py: 1.5,
                fontSize: '16px',
                fontWeight: 'bold',
                backgroundColor: '#1976d2',
                '&:hover': { backgroundColor: '#1565c0' }
              }}
            >
              {t('login_button')}
            </Button>
          </Box>
        </Box>
      </Modal>

      <Snackbar
        open={alert.open}
        autoHideDuration={4000}
        onClose={() => setAlert(a => ({ ...a, open: false }))}
      >
        <Alert
          onClose={() => setAlert(a => ({ ...a, open: false }))}
          severity={alert.severity}
          sx={{ width: '100%' }}
        >
          {alert.msg}
        </Alert>
      </Snackbar>
    </>
  );
};

export default LoginForm;
