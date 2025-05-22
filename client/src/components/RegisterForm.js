// src/components/RegisterForm.js
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
  bgcolor: 'rgba(227, 242, 253, 0.95)',
  boxShadow: 24,
  p: 3,
  borderRadius: '12px',
  border: '1px solid #90caf9',
  maxHeight: '80vh',
  overflowY: 'auto'
};

export default function RegisterForm({ open, handleClose }) {
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [studentNo, setStudentNo] = useState('');
  const [community, setCommunity] = useState(''); // optional free-text

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleRegister = async () => {
    setError('');
    if (!username || !password || !confirmPassword || !name || !surname || !email || !studentNo) {
      setError(t('register_missing_fields'));
      return;
    }
    if (password !== confirmPassword) {
      setError(t('register_password_mismatch'));
      return;
    }
    if (!emailRegex.test(email)) {
      setError(t('register_invalid_email'));
      return;
    }

    setLoading(true);
    try {
      const payload = {
        username,
        password,
        name,
        surname,
        email,
        student_no: studentNo,
        role: 'admin'      // <<< burada default role artık admin
      };
      if (community) {
        payload.community = community;
      }

      const { data } = await axios.post(
        `${API_URL}/register`,
        payload
      );

      if (data.success) {
        setSnackbarOpen(true);
        // clear fields
        setUsername(''); setPassword(''); setConfirmPassword('');
        setName(''); setSurname(''); setEmail(''); setStudentNo(''); setCommunity('');
        handleClose();
      } else {
        const msg = data.message ? data.message.replace(/\.$/, '') : t('register_failed');
        setError(msg);
      }
    } catch (err) {
      console.error('Kayıt hatası:', err);
      const serverMsg = err.response?.data?.message;
      const errMsg = serverMsg ? serverMsg.replace(/\.$/, '') : t('register_error');
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal open={open} onClose={handleClose}>
        <Box sx={style}>
          <IconButton onClick={handleClose} sx={{ position: 'absolute', top: 8, right: 8, color: '#1565c0' }}>
            <CloseIcon />
          </IconButton>

          <Typography variant="h6" gutterBottom color="primary">
            {t('register_form_title')}
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <TextField fullWidth label={t('register_name')} margin="normal" value={name} onChange={e => setName(e.target.value)} />
          <TextField fullWidth label={t('register_surname')} margin="normal" value={surname} onChange={e => setSurname(e.target.value)} />
          <TextField fullWidth label={t('register_student_no')} margin="normal" value={studentNo} onChange={e => setStudentNo(e.target.value)} />
          <TextField fullWidth label={t('register_email')} type="email" margin="normal" value={email} onChange={e => setEmail(e.target.value)} />
          <TextField fullWidth label={t('register_username')} margin="normal" value={username} onChange={e => setUsername(e.target.value)} />
          <TextField fullWidth label={t('register_password')} type="password" margin="normal" value={password} onChange={e => setPassword(e.target.value)} />
          <TextField fullWidth label={t('register_confirm_password')} type="password" margin="normal" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
          
          
         
          <TextField
            fullWidth
            label={t('register_community')}
            margin="normal"
            value={community}
            onChange={e => setCommunity(e.target.value)}
            placeholder={t('register_community_optional')}
          />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Button variant="contained" size="large" onClick={handleRegister} disabled={loading}
              sx={{ textTransform: 'none', borderRadius: '8px', px: 3, py: 1.5, fontSize: '16px', fontWeight: 'bold', backgroundColor: '#1976d2', '&:hover': { backgroundColor: '#1565c0' } }}>
              {loading ? t('register_loading') : t('register_button')}
            </Button>
          </Box>
        </Box>
      </Modal>

      <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={() => setSnackbarOpen(false)}>
        <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%' }}>
          {t('register_check_email')}
        </Alert>
      </Snackbar>
    </>
  );
}
