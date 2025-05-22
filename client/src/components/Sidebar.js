// src/components/Sidebar.js

import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  Button,
  Typography,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Divider,
  CircularProgress,
  IconButton,
  InputAdornment,
} from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import axios from 'axios';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import hacettepeLogo from '../assets/hacettepe_logo.png';
import { useTranslation } from 'react-i18next';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';


const drawerWidth = 300;

// Hacettepe Üniversitesi için viewbox (sol alt ve sağ üst koordinatlar)
const HACETTEPE_VIEWBOX = {
  min_lon: 32.72,
  min_lat: 39.86,
  max_lon: 32.75,
  max_lat: 39.87,
};

const Sidebar = ({
  transportMode,
  setTransportMode,
  onCalculateRoute,
  onSearchResults,
  onSelectStart,
  onSelectEnd,
  startPoint,
  endPoint,
  setSnackbar,
  routeDistance,
}) => {
  const { t } = useTranslation();

  // Nominatim autocomplete için
  const [startOptions, setStartOptions] = useState([]);
  const [endOptions, setEndOptions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  
  // Seçilen noktalar
  const [selectedStart, setSelectedStart] = useState(null);
  const [selectedEnd, setSelectedEnd] = useState(null);
  // Input değerleri
  const [startInputValue, setStartInputValue] = useState('');
  const [endInputValue, setEndInputValue] = useState('');
  // Loading durumları
  const [loadingStart, setLoadingStart] = useState(false);
  const [loadingEnd, setLoadingEnd] = useState(false);

  // **Yeni:** Birimleri backend’den çekmek için state
  const [units, setUnits] = useState([]);

  // startPoint/endPoint prop güncellemelerini yakala
  useEffect(() => {
    if (startPoint) {
      setSelectedStart(startPoint);
      setStartInputValue(`${startPoint.lat}; ${startPoint.lng}`);
    }
  }, [startPoint]);

  useEffect(() => {
    if (endPoint) {
      setSelectedEnd(endPoint);
      setEndInputValue(`${endPoint.lat}; ${endPoint.lng}`);
    }
  }, [endPoint]);
 // Başlangıç ve bitişi değiş tokuş eder
// Sidebar.js içinde, component fonksiyonunun en üstlerinde:
const handleSwapPoints = () => {
  // Local state’te takılıp kalanları swap et
  const oldStart = selectedStart;
  const oldEnd = selectedEnd;
  setSelectedStart(oldEnd);
  setSelectedEnd(oldStart);

  // Parent component’e bildir (MapComponent’in startPoint/endPoint’ini günceller)
  if (oldEnd) onSelectStart(oldEnd);
  if (oldStart) onSelectEnd(oldStart);
};

  // **Yeni:** Component mount olduğunda PG birimlerini çek
  useEffect(() => {
    axios.get('/api/birimler')
      .then(res => setUnits(res.data))
      .catch(err => {
        console.error('Birimler yüklenirken hata:', err);
        setSnackbar({ open: true, message: t('birimler_yuklenemedi'), severity: 'error' });
      });
  }, []);

  // Arama seçeneklerini getirme fonksiyonu (Nominatim + birimler)
  const fetchOptions = async (query, setOptions) => {
    try {
      let options = [{ display_name: t('konumumu_kullan'), isCurrentLocation: true }];

  
      // PG birimlerini filtrele ve ekle
      const matchingUnits = units
        .filter(u => u.name.toLowerCase().includes(query.toLowerCase()))
        .map(u => ({
          display_name: u.name,
          lat: u.latitude,
          lng: u.longitude,
          isUnit: true,
        }));
      options = options.concat(matchingUnits);

      setOptions(options);
    } catch (error) {
      console.error('Arama hatası:', error);
      setSnackbar({ open: true, message: t('arama_hatasi'), severity: 'error' });
    }
  };

  // "Konumumu Kullan" seçeneği
  const handleLocationSelect = async (type) => {
    if (!navigator.geolocation) {
      setSnackbar({ open: true, message: t('geolocation_destegi_yok'), severity: 'error' });
      return;
    }
    const setLoading = type === 'start' ? setLoadingStart : setLoadingEnd;
    const setSelected = type === 'start' ? setSelectedStart : setSelectedEnd;
    const setInputValue = type === 'start' ? setStartInputValue : setEndInputValue;

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const currentLocation = {
          display_name: t('konumum'),
          lat: latitude,
          lng: longitude,
        };
        setSelected(currentLocation);
        setInputValue(`${latitude.toFixed(6)}; ${longitude.toFixed(6)}`);
        setLoading(false);
        setSnackbar({ open: true, message: t('konum_alindi'), severity: 'success' });
      },
      (error) => {
        console.error('Geolocation hatası:', error);
        setSnackbar({ open: true, message: t('konum_alinirken_hata'), severity: 'error' });
        setLoading(false);
      }
    );
  };

  // Seçim değişikliği
  const handleChange = async (type, event, value) => {
    if (value && value.isCurrentLocation) {
      await handleLocationSelect(type);
    } else {
      if (type === 'start') {
        setSelectedStart(value);
        setStartInputValue(value ? `${value.lat}; ${value.lng}` : '');
      } else {
        setSelectedEnd(value);
        setEndInputValue(value ? `${value.lat}; ${value.lng}` : '');
      }
    }
  };

  // Input değişimi (autocomplete tetikleme)
  const handleStartInputChange = (event, value, reason) => {
    if (reason === 'input') {
      fetchOptions(value, setStartOptions);
    }
  };
  const handleEndInputChange = (event, value, reason) => {
    if (reason === 'input') {
      fetchOptions(value, setEndOptions);
    }
  };

  // Rota hesapla
  const handleCalculateRouteClick = () => {
    if (!selectedStart || !selectedEnd) {
      setSnackbar({ open: true, message: t('baslangic_bitis_seciniz'), severity: 'warning' });
      return;
    }
    onCalculateRoute(selectedStart, selectedEnd, transportMode);
  };

  // Genel arama butonu
  const handleSearch = async () => {
    if (!searchQuery) {
      setSnackbar({ open: true, message: t('arama_sorgusu_girin'), severity: 'warning' });
      return;
    }
    try {
      const response = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
          q: searchQuery,
          format: 'json',
          addressdetails: 1,
          limit: 10,
          viewbox: `${HACETTEPE_VIEWBOX.min_lon},${HACETTEPE_VIEWBOX.max_lat},${HACETTEPE_VIEWBOX.max_lon},${HACETTEPE_VIEWBOX.min_lat}`,
          bounded: 1,
        },
      });
      setSearchResults(response.data);
      onSearchResults(response.data);
    } catch (error) {
      console.error('Arama hatası:', error);
      setSnackbar({ open: true, message: t('arama_sirasinda_hata'), severity: 'error' });
    }
  };

  return (
    <Drawer
      variant="permanent"
      anchor="left"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
      }}
    >
      <Box sx={{ overflow: 'auto', padding: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Logo ve Başlık */}
        <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
          <img
            src={hacettepeLogo}
            alt="Hacettepe Üniversitesi"
            style={{ width: '40px', height: '40px', marginRight: '10px' }}
          />
          <Typography variant="h6">{t('hacettepe_harita')}</Typography>
        </Box>
        <Divider sx={{ marginY: 1 }} />

        {/* Başlangıç Noktası Arama Kutusu */}
        <Autocomplete
          freeSolo
          options={startOptions}
          getOptionLabel={option =>
            option.isCurrentLocation
              ? option.display_name
              : option.isUnit
                ? option.display_name
                : `${option.display_name} (${option.lat}, ${option.lng})`
          }
          value={selectedStart}
          inputValue={startInputValue}
          onInputChange={(e, newVal, reason) => {
            if (reason === 'input') {
              setStartInputValue(newVal);
              handleStartInputChange(e, newVal, reason);
            }
          }}
          onChange={(e, val) => handleChange('start', e, val)}
          renderOption={(props, option) => (
            <li {...props} key={`${option.display_name}-${option.lat}`}>
              {option.display_name}{option.isUnit && ' (Birim)'}
            </li>
          )}
          renderInput={(params) => (
            <TextField
              {...params}
              label={t('baslangic_noktasi')}
              variant="outlined"
              size="small"
              margin="normal"
              onFocus={onSelectStart}
              onClick={onSelectStart}
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => handleLocationSelect('start')}
                        sx={{ padding: 0 }}
                        title={t('konumumu_kullan')}
                      >
                        <LocationOnIcon />
                      </IconButton>
                    </InputAdornment>
                    {loadingStart && <CircularProgress color="inherit" size={20} />}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
          sx={{ marginBottom: 2 }}
        />
       <Box
  sx={{
    display: 'flex',
    justifyContent: 'center',
    mt: 1,
    mb: 1
  }}
>
  <IconButton
    onClick={handleSwapPoints}
    color="primary"
    size="small"
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      py:0,
      my: 0,     // hem üstte hem altta ince boşluk
    }}
    title={t('swap_points')}
  >
    <SwapHorizIcon />
  </IconButton>
</Box>

        {/* Bitiş Noktası Arama Kutusu */}
        <Autocomplete
          freeSolo
          options={endOptions}
          getOptionLabel={option =>
            option.isCurrentLocation
              ? option.display_name
              : option.isUnit
                ? option.display_name
                : `${option.display_name} (${option.lat}, ${option.lng})`
          }
          value={selectedEnd}
          inputValue={endInputValue}
          onInputChange={(e, newVal, reason) => {
            if (reason === 'input') {
              setEndInputValue(newVal);
              handleEndInputChange(e, newVal, reason);
            }
          }}
          onChange={(e, val) => handleChange('end', e, val)}
          renderOption={(props, option) => (
            <li {...props} key={`${option.display_name}-${option.lat}`}>
              {option.display_name}{option.isUnit && ' (Birim)'}
            </li>
          )}
          renderInput={(params) => (
            <TextField
              {...params}
              label={t('bitis_noktasi')}
              variant="outlined"
              size="small"
              margin="normal"
              onFocus={onSelectEnd}
              onClick={onSelectEnd}
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => handleLocationSelect('end')}
                        sx={{ padding: 0 }}
                        title={t('konumumu_kullan')}
                      >
                        <LocationOnIcon />
                      </IconButton>
                    </InputAdornment>
                    {loadingEnd && <CircularProgress color="inherit" size={20} />}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
          sx={{ marginBottom: 2 }}
        />
 {/* ==== Mesafe Bilgisi ==== */}
        {routeDistance != null && (
         <Typography
          variant="body1"
          sx={{ mt: 1, mb: 2, fontWeight: '500', color: 'primary.main' }}
         >
           {t('distance_label')} {Math.round(routeDistance)} {t('mesafe_unit')}
         </Typography>
       )}
        {/* Vasıta Türü Seçimi */}
        <FormControl component="fieldset" sx={{ marginTop: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            {t('vasita_turu')}
          </Typography>
          <RadioGroup
            row
            aria-label="transportMode"
            name="row-radio-buttons-group"
            value={transportMode}
            onChange={(e) => setTransportMode(e.target.value)}
          >
            <FormControlLabel value="walking" control={<Radio />} label={t('yaya')} />
            <FormControlLabel value="cycling" control={<Radio />} label={t('bisiklet')} />
            <FormControlLabel value="driving" control={<Radio />} label={t('arac')} />
          </RadioGroup>
        </FormControl>
        
        {/* Rota Hesapla Butonu */}
        <Button
          variant="contained"
          color="primary"
          fullWidth
          sx={{ marginTop: 2 }}
          onClick={handleCalculateRouteClick}
          disabled={!selectedStart || !selectedEnd}
        >
          {t('rota_hesapla')}
        </Button>
        <Divider sx={{ marginY: 2 }} />

      {/* —————— Üniversite içi arama başlığı —————— */}
      <Typography
        variant="subtitle1"
        sx={{
          mt: 1,
          mb: 1,
          fontWeight: '500',
          color: 'primary.main'
        }}
      >
        Üniversite içinde Arama
      </Typography>

      {/* Arama Kutusu */}
      <Box sx={{ marginTop: 0 }}>
          <TextField
            label={t('arama')}
            variant="outlined"
            size="small"
            fullWidth
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{ marginTop: 1 }}
            onClick={handleSearch}
          >
            {t('ara')}
          </Button>
        </Box>

        {/* Spacer */}
        <Box sx={{ flexGrow: 1 }} />
      </Box>
    </Drawer>
  );
};

export default Sidebar;
