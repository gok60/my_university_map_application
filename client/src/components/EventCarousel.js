// src/components/EventCarousel.js

import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Box, Typography, Link } from '@mui/material';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { API_URL } from './config';
import './EventCarousel.css';

const EventCarousel = ({
  eventGroup,
  userRole,
  userToken,
  setEvents,
  setSnackbar,
}) => {
  const { t } = useTranslation();
  const [swiper, setSwiper] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const contentRefs = useRef([]);

  useEffect(() => {
    if (swiper) swiper.update();
  }, [swiper, eventGroup]);

  useEffect(() => {
    const el = contentRefs.current[activeIndex];
    if (!el) return;
    el.style.fontSize = el.scrollHeight > el.clientHeight ? '0.875rem' : '1rem';
  }, [activeIndex, eventGroup]);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (window.confirm(t('confirmDeleteEvent'))) {
      try {
        await axios.delete(`${API_URL}/events/${id}`, { headers: { Authorization: `Bearer ${userToken}` } });
        setSnackbar({ open: true, message: t('eventDeleted'), severity: 'success' });
        setEvents(prev => prev.filter(ev => ev.id !== id));
      } catch (error) {
        setSnackbar({ open: true, message: t('eventDeleteError'), severity: 'error' });
      }
    }
  };

  return (
    <Box className="carousel-container">
      <Swiper
        modules={[Navigation, Pagination]}
        spaceBetween={10}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        loop
        className="custom-swiper"
        onSwiper={setSwiper}
        onSlideChange={sw => setActiveIndex(sw.realIndex)}
      >
        {eventGroup.map((event, idx) => (
          <SwiperSlide key={event.id}>
            <Box
              className="carousel-slide-content"
              ref={el => (contentRefs.current[idx] = el)}
            >
              {/* Eğer resim varsa göster */}
              {event.image_path && (
                <Box
                  component="img"
                  src={`${API_URL}${event.image_path}`}
                  alt={event.title || ''}
                  onError={e => console.log(`Broken img src: ${e.target.src}`)}
                  onClick={() => window.open(`${API_URL}${event.image_path}`, '_blank')}
                  sx={{ width: '100%', maxHeight: 200, objectFit: 'cover', mb: 1, cursor: 'pointer' }}
                />
              )}

              {/* Diğer etkinlik bilgileri */}
              <Typography variant="h5" gutterBottom>{event.title}</Typography>
              {event.website && (
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>{t('website')}:</strong>&nbsp;
                  <Link href={event.website} target="_blank" rel="noopener noreferrer">
                    {event.website}
                  </Link>
                </Typography>
              )}
              <Typography variant="body1"><strong>{t('date')}:</strong> {event.date}</Typography>
              <Typography variant="body1"><strong>{t('time')}:</strong> {event.time || t('notSpecified')}</Typography>
              <Typography variant="body1"><strong>{t('location')}:</strong> {event.location}</Typography>
              <Typography variant="body1"><strong>{t('eventType')}:</strong> {t(event.event_type)}</Typography>
              <Typography variant="body1"><strong>{t('contactInfo')}:</strong> {event.contact_info}</Typography>
              <Typography variant="body1"><strong>{t('description')}:</strong> {event.description}</Typography>

              {/* Yönetici silme kontrolü */}
              {(userRole === 'admin' || userRole === 'supervisor') && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Box onClick={e => handleDelete(e, event.id)} title={t('deleteEvent')} sx={{ cursor: 'pointer', ml: 1 }}>
                    🗑️
                  </Box>
                </Box>
              )}
            </Box>
          </SwiperSlide>
        ))}
      </Swiper>
    </Box>
  );
};

EventCarousel.propTypes = {
  eventGroup: PropTypes.arrayOf(PropTypes.object).isRequired,
  userRole: PropTypes.string.isRequired,
  userToken: PropTypes.string.isRequired,
  setEvents: PropTypes.func.isRequired,
  setSnackbar: PropTypes.func.isRequired,
};

export default EventCarousel;
