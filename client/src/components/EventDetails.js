// src/components/EventDetails.js
import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, IconButton, Link } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { API_URL } from './config';

const EventDetails = ({
  event,
  userRole,
  userToken,
  setEvents,
  setSnackbar,
}) => {
  const { t } = useTranslation();

  const handleDelete = async () => {
    if (window.confirm(t('confirmDeleteEvent'))) {
      try {
        await axios.delete(`${API_URL}/events/${event.id}`, {
          headers: { Authorization: `Bearer ${userToken}` }
        });
        setSnackbar({ open: true, message: t('eventDeleted'), severity: 'success' });
        setEvents(prev => prev.filter(e => e.id !== event.id));
      } catch (error) {
        console.error('Delete error:', error);
        setSnackbar({ open: true, message: t('eventDeleteError'), severity: 'error' });
      }
    }
  };

  return (
    <Box>
      <Box>
        {/* Resim varsa göster ve üzerine tıklandığında büyük resim aç */}
        {event.image_path && (
          <Box
            component="img"
            src={`${API_URL}${event.image_path}`}
            alt={event.title}
            sx={{ width: '100%', maxHeight: 200, objectFit: 'cover', mb: 1, cursor: 'pointer' }}
            onClick={() => window.open(`${API_URL}${event.image_path}`, '_blank')}
          />
        )}

        <Typography variant="h6" gutterBottom>
          {event.title}
        </Typography>

        {event.website && (
          <Typography gutterBottom>
            <strong>{t('website')}:</strong>&nbsp;
            <Link href={event.website} target="_blank" rel="noopener noreferrer">
              {event.website}
            </Link>
          </Typography>
        )}

        <Typography gutterBottom>
          <strong>{t('date')}:</strong> {event.date}
        </Typography>
        <Typography gutterBottom>
          <strong>{t('time')}:</strong> {event.time || t('notSpecified')}
        </Typography>
        <Typography gutterBottom>
          <strong>{t('location')}:</strong> {event.location}
        </Typography>
        <Typography gutterBottom>
          <strong>{t('eventType')}:</strong> {t(event.event_type)}
        </Typography>
        <Typography gutterBottom>
          <strong>{t('contactInfo')}:</strong> {event.contact_info}
        </Typography>
        <Typography gutterBottom>
          <strong>{t('description')}:</strong> {event.description}
        </Typography>
      </Box>

      {/* Yönetici silme kontrolü */}
      {(userRole === 'admin' || userRole === 'supervisor') && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
          <IconButton
            color="secondary"
            size="small"
            title={t('deleteEvent')}
            onClick={() => handleDelete()}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      )}
    </Box>
  );
};

EventDetails.propTypes = {
  event: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    time: PropTypes.string,
    location: PropTypes.string.isRequired,
    event_type: PropTypes.string.isRequired,
    contact_info: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    website: PropTypes.string,
    image_path: PropTypes.string,
  }).isRequired,
  userRole: PropTypes.string.isRequired,
  userToken: PropTypes.string.isRequired,
  setEvents: PropTypes.func.isRequired,
  setSnackbar: PropTypes.func.isRequired,
};

export default EventDetails;
