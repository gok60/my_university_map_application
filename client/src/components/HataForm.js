// src/components/HataForm.js
import React, { useState, useEffect } from 'react';
import { Modal, Box, TextField, Button, Typography, Snackbar, Alert } from '@mui/material';
import axios from 'axios';
import { API_URL } from './config';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: '8px',
};

const HataForm = ({ open, handleClose, selectedHata, userToken, loadHatalar, setSnackbar }) => {
  const [isimSoyisim, setIsimSoyisim] = useState('');
  const [hataTuru, setHataTuru] = useState('');
  const [aciklama, setAciklama] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [hataId, setHataId] = useState(null);

  useEffect(() => {
    if (selectedHata && selectedHata.id) {
      // Hata Düzenleme Modu
      setIsimSoyisim(selectedHata.isim_soyisim || '');
      setHataTuru(selectedHata.hata_turu || '');
      setAciklama(selectedHata.aciklama || '');
      setIsEditMode(true);
      setHataId(selectedHata.id);
    } else if (selectedHata && selectedHata.lat && selectedHata.lng) {
      // Yeni Hata Ekleme Modu
      setIsimSoyisim('');
      setHataTuru('');
      setAciklama('');
      setIsEditMode(false);
      setHataId(null);
    }
  }, [selectedHata]);

  const handleSave = async () => {
    if (!isimSoyisim || !hataTuru || !aciklama) {
      setSnackbar({ open: true, message: 'Lütfen tüm alanları doldurun.', severity: 'warning' });
      return;
    }

    const hataData = {
      isim_soyisim: isimSoyisim,
      hata_turu: hataTuru,
      aciklama: aciklama,
      latitude: selectedHata.lat || selectedHata.latitude,
      longitude: selectedHata.lng || selectedHata.longitude,
    };

    try {
      if (isEditMode) {
        // Hata Güncelleme
        await axios.put(`${API_URL}/hatalar/${hataId}`, hataData, {
          headers: {
            'Authorization': `Bearer ${userToken}`
          }
        });
        setSnackbar({ open: true, message: 'Hata başarıyla güncellendi!', severity: 'success' });
      } else {
        // Yeni Hata Ekleme
        await axios.post(`${API_URL}/hatalar`, hataData, {
          headers: {
            'Authorization': `Bearer ${userToken}`
          }
        });
        setSnackbar({ open: true, message: 'Hata başarıyla kaydedildi!', severity: 'success' });
      }
      loadHatalar();
      handleClose();
    } catch (error) {
      console.error('Hata formu gönderilirken bir sorun oluştu:', error);
      setSnackbar({ open: true, message: 'Hata formu gönderilirken bir sorun oluştu.', severity: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!hataId) return;

    if (window.confirm('Hata silinsin mi?')) {
      try {
        await axios.delete(`http://localhost:6000/api/hatalar/${hataId}`, {
          headers: {
            'Authorization': `Bearer ${userToken}`
          }
        });
        setSnackbar({ open: true, message: 'Hata başarıyla silindi!', severity: 'success' });
        loadHatalar();
        handleClose();
      } catch (error) {
        console.error('Hata silinirken bir sorun oluştu:', error);
        setSnackbar({ open: true, message: 'Hata silinirken bir sorun oluştu.', severity: 'error' });
      }
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={style}>
        <Typography variant="h6" component="h2" gutterBottom>
          {isEditMode ? 'Hata Düzenle' : 'Hata Ekle'}
        </Typography>
        <TextField 
          fullWidth 
          label="İsim Soyisim" 
          margin="normal" 
          value={isimSoyisim} 
          onChange={(e) => setIsimSoyisim(e.target.value)} 
        />
        <TextField 
          fullWidth 
          label="Hata Türü" 
          margin="normal" 
          value={hataTuru} 
          onChange={(e) => setHataTuru(e.target.value)} 
        />
        <TextField 
          fullWidth 
          label="Açıklama" 
          multiline 
          rows={4}
          margin="normal" 
          value={aciklama} 
          onChange={(e) => setAciklama(e.target.value)} 
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
          <Button variant="contained" color="primary" onClick={handleSave}>
            {isEditMode ? 'Güncelle' : 'Kaydet'}
          </Button>
          {isEditMode && (
            <Button variant="contained" color="secondary" onClick={handleDelete}>
              Sil
            </Button>
          )}
        </Box>
      </Box>
    </Modal>
  );
};

export default HataForm;
