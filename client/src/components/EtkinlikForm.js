// src/components/EventForm.js
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box
} from '@mui/material';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { API_URL } from './config';

export default function EventForm({
  open,
  handleClose,
  selectedPosition,
  userToken,
  refreshEvents,
  setSnackbar,
  initialData,
}) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    event_type: '',
    contact_info: '',
    description: '',
    website: ''
  });
  const [image, setImage] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        date: initialData.date || '',
        time: initialData.time || '',
        location: initialData.location || '',
        event_type: initialData.event_type || '',
        contact_info: initialData.contact_info || '',
        description: initialData.description || '',
        website: initialData.website || ''
      });
      setImage(null);
    }
  }, [initialData]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(f => ({ ...f, [name]: value }));
    setErrors(e => ({ ...e, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.title) errs.title = t('titleRequired');
    if (!formData.date) errs.date = t('dateRequired');
    if (!formData.location) errs.location = t('locationRequired');
    if (!formData.event_type) errs.eventTypeRequired = t('eventTypeRequired');
    if (!formData.contact_info) errs.contactInfo = t('contactInfoRequired');
    if (!formData.description) errs.description = t('descriptionRequired');
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      setSnackbar({ open: true, message: t('fillRequiredFields'), severity: 'warning' });
      return;
    }

    const payload = new FormData();
    Object.entries(formData).forEach(([key, val]) => {
      payload.append(key, val || '');
    });
    payload.append('latitude', selectedPosition.lat);
    payload.append('longitude', selectedPosition.lng);
    if (image) payload.append('image', image);

    try {
      const headers = { Authorization: `Bearer ${userToken}`, 'Content-Type': 'multipart/form-data' };
      let res;
      if (initialData?.id) {
        res = await axios.put(`${API_URL}/events/${initialData.id}`, payload, { headers });
        setSnackbar({ open: true, message: t('updatedSuccess'), severity: 'success' });
      } else {
        res = await axios.post(`${API_URL}/events`, payload, { headers });
        setSnackbar({ open: true, message: t('createdSuccess'), severity: 'success' });
      }
      handleClose();
      refreshEvents(res.data.event ?? res.data);
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: err.response?.data?.message || t('genericError'), severity: 'error' });
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>{initialData ? t('editEvent') : t('newEvent')}</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth margin="dense" label={t('title')} name="title"
          value={formData.title} onChange={handleChange}
          error={!!errors.title} helperText={errors.title}
        />
        <TextField
          fullWidth margin="dense" label={t('date')} name="date" type="date"
          value={formData.date} onChange={handleChange}
          InputLabelProps={{ shrink: true }}
          error={!!errors.date} helperText={errors.date}
        />
        <TextField
          fullWidth margin="dense" label={t('time')} name="time" type="time"
          value={formData.time} onChange={handleChange}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          fullWidth margin="dense" label={t('location')} name="location"
          value={formData.location} onChange={handleChange}
          error={!!errors.location} helperText={errors.location}
        />
        <TextField
          fullWidth select margin="dense" label={t('eventType')} name="event_type"
          value={formData.event_type} onChange={handleChange}
          error={!!errors.eventTypeRequired} helperText={errors.eventTypeRequired}
        >
          {['Seminar','Workshop','Concert','Sports','Expo','Course','Career and Entrepreneurship','Symposium','Cultural and Artistic Events'].map(val => (
            <MenuItem key={val} value={val}>{t(val)}</MenuItem>
          ))}
        </TextField>
        <TextField
          fullWidth margin="dense" label={t('contactInfo')} name="contact_info"
          value={formData.contact_info} onChange={handleChange}
          error={!!errors.contactInfo} helperText={errors.contactInfo}
        />
        <TextField
          fullWidth multiline rows={3} margin="dense" label={t('description')} name="description"
          value={formData.description} onChange={handleChange}
          error={!!errors.description} helperText={errors.description}
        />
        <TextField
          fullWidth margin="dense" label={t('website')} name="website"
          value={formData.website} onChange={handleChange}
        />
        <Box mt={2}>
          <Button variant="outlined" component="label">
            {image?.name || t('chooseImage')}
            <input type="file" accept="image/*" hidden onChange={e => setImage(e.target.files[0])} />
          </Button>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>{t('cancel')}</Button>
        <Button variant="contained" onClick={handleSubmit}>{initialData ? t('update') : t('save')}</Button>
      </DialogActions>
    </Dialog>
  );
}
