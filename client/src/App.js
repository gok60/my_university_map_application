// src/App.js

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Sidebar from './components/Sidebar';
import MapComponent from './components/MapComponent';
import Birimler from './components/Birimler';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import ErrorBoundary from './components/ErrorBoundary';
import SupervisorPanel from './components/SupervisorPanel';
import jwt_decode from 'jwt-decode';
import { Snackbar, Alert, Box, Button, Typography, IconButton } from '@mui/material';
import 'leaflet/dist/leaflet.css';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

function App() {
  const { t } = useTranslation();
  // ==============================
  // 1. Kullanıcı Kimlik Doğrulama Durumları
  // ==============================
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userToken, setUserToken] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [username, setUsername] = useState('');
  const [routeDistance, setRouteDistance] = useState(null);

  // ==============================
  // 2. Rota Hesaplama Durumları
  // ==============================
  const [startPoint, setStartPoint] = useState(null);
  const [endPoint, setEndPoint] = useState(null);
  const [transportMode, setTransportMode] = useState('walking'); // Varsayılan olarak 'walking'
  const [routeTrigger, setRouteTrigger] = useState(0); // Rota tetikleyicisi

  // ==============================
  // 3. Seçim Modu Durumu
  // ==============================
  const [selectionMode, setSelectionMode] = useState(null); // 'start', 'end', veya null

  // ==============================
  // 4. Arama Durumları
  // ==============================
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // ==============================
  // 5. Snackbar (Bildirim) Durumu
  // ==============================
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // ==============================
  // 6. Birimler (Units) Durumu
  // ==============================
  const [selectedBirim, setSelectedBirim] = useState(null);
  const [isBirimlerOpen, setIsBirimlerOpen] = useState(false); // Birimler panelinin açık olup olmadığını kontrol eder

  // ==============================
  // 7. Refresh Trigger for Birimler.js
  // ==============================
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // ==============================
  // 8. useEffect Hook'u: Sayfa Yüklendiğinde Token Kontrolü
  // ==============================
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwt_decode(token);
        const currentTime = Date.now() / 1000;
        if (decoded.exp > currentTime) {
          setIsLoggedIn(true);
          setUserToken(token);
          setUserRole(decoded.role);
          setUsername(decoded.username);
          setSnackbar({ open: true, message: t('login_success'), severity: 'success' });
        } else {
          localStorage.removeItem('token');
        }
      } catch (error) {
        console.error('Token decode hatası:', error);
        localStorage.removeItem('token');
      }
    }
  }, []);
 
  // ==============================
  // 9. Handler Fonksiyonları
  // ==============================

  // 9.1. Giriş Başarılı Olduğunda
  const handleLoginSuccess = (token, role, username) => {
    setIsLoggedIn(true);
    setUserToken(token);
    setUserRole(role);
    setUsername(username);
    localStorage.setItem('token', token);
    setSnackbar({ open: true, message: t('login_success'), severity: 'success' });
  };

  // 9.2. Çıkış Yapma Fonksiyonu
  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserToken(null);
    setUserRole(null);
    setUsername('');
    localStorage.removeItem('token');
    setSnackbar({ open: true, message: t('logout_success'), severity: 'info' });
  };

  // 9.3. Snackbar'ı Kapatma Fonksiyonu
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // 9.4. Rota Hesaplama Fonksiyonu
  const handleCalculateRoute = (selectedStart, selectedEnd, mode) => {
    if (!selectedStart || !selectedEnd) {
      setSnackbar({ open: true, message: t('select_start_end'), severity: 'warning' });
      return;
    }

    setTransportMode(mode || transportMode); // Vasıta türünü güncelle
    setStartPoint(selectedStart);
    setEndPoint(selectedEnd);
    setRouteTrigger((prev) => prev + 1); // routeTrigger'ı artır
    setSnackbar({ open: true, message: t('route_calculating'), severity: 'info' });
  };

  // 9.5. Sidebar'dan Gelen Arama Sonuçlarını Alma Fonksiyonu
  const handleSearchResults = (results) => {
    setSearchResults(results);
    setShowSearchResults(true);
  };

  // 9.6. Arama Sonucuna Tıklama Fonksiyonu
  const handleResultClick = (result) => {
    setStartPoint(null);
    setEndPoint(null);
    setTransportMode('walking'); // Varsayılan vasıta türü
    setSelectionMode(null);
    setSnackbar({ open: true, message: t('search_navigating'), severity: 'info' });

    // Seçilen arama sonucunu başlangıç noktası olarak ayarla
    setStartPoint({
      display_name: result.display_name,
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
    });

    setEndPoint(null);
    setShowSearchResults(false);
  };

  // 9.7. Arama Sonuçlarını Kapatma Fonksiyonu
  const handleCloseSearchResults = () => {
    setShowSearchResults(false);
  };

  // 9.8. Başlangıç Noktası Seçme Modunu Başlatma Fonksiyonu
  const handleSelectStart = () => {
    setSelectionMode('start');
    setSnackbar({ open: true, message: t('select_start_instruction'), severity: 'info' });
  };

  // 9.9. Bitiş Noktası Seçme Modunu Başlatma Fonksiyonu
  const handleSelectEnd = () => {
    setSelectionMode('end');
    setSnackbar({ open: true, message:  t('select_end_instruction'), severity: 'info' });
  };

  // 9.10. Harita Üzerinde Seçim Yapıldığında
  const handleMapSelection = (type, point) => {
    if (type === 'start') {
      setStartPoint(point);
      setSnackbar({ open: true, message: t('start_point_selected'), severity: 'success' });
    } else if (type === 'end') {
      setEndPoint(point);
      setSnackbar({ open: true, message: t('end_point_selected'), severity: 'success' });
    }
    setSelectionMode(null); // Seçim modundan çık
  };

  // 9.11. Birim Seçildiğinde
  const handleBirimSelect = (birim) => {
    console.log('App.js - Seçilen Birim:', birim); // Debugging
    setSelectedBirim(birim);
    setIsBirimlerOpen(false); // Birimler panelini kapat
    setSnackbar({ open: true, message: `${birim.name} ${t('unit_selected')}`, severity: 'info' });

    // Birimler.js için yeniden yükleme tetikleyici
    setRefreshTrigger((prev) => prev + 1);
  };

  // 9.12. Birimler Panelini Açma Fonksiyonu
  const openBirimler = () => {
    setIsBirimlerOpen(true);
  };
  if (isLoggedIn && userRole === 'supervisor') {
    return (
      <SupervisorPanel
        userToken={userToken}
        onLogout={handleLogout}
      />
    );
  }
  return (
    <ErrorBoundary>
      <Box sx={{ display: 'flex', height: '120vh', position: 'relative' }}>
        {/* ==============================
        10. Sidebar Bileşeni
        ============================== */}
        <Sidebar
          transportMode={transportMode}
          setTransportMode={setTransportMode} // Vasıta türünü güncelleme fonksiyonu
          onCalculateRoute={handleCalculateRoute} // Rota hesaplama fonksiyonunu geçir
          onSearchResults={handleSearchResults} // Arama sonuçlarını yönetme fonksiyonunu geçir
          onSelectStart={handleSelectStart} // Başlangıç seçme fonksiyonunu geçir
          onSelectEnd={handleSelectEnd} // Bitiş seçme fonksiyonunu geçir
          startPoint={startPoint} // startPoint'ı geçir
          endPoint={endPoint}     // endPoint'i geçir
          setSnackbar={setSnackbar} // Snackbar fonksiyonunu geçir
          routeDistance={routeDistance}
        />

        {/* ==============================
        11. Ana İçerik Alanı
        ============================== */}
        <Box sx={{ flexGrow: 1, position: 'relative' }}>
          {/* ==============================
          12. Üst Sağ Köşe: Birimler, Giriş/Kayıt veya Kullanıcı Bilgileri
          ============================== */}
          <Box sx={{ position: 'absolute', top: 16, right: 50, zIndex: 1000, display: 'flex', alignItems: 'center' }}>
            {/* Birimler Butonu */}
            <IconButton
              color="primary"
              onClick={openBirimler}
              sx={{ marginRight: 2 }}
              title={t('units')}
            >
            </IconButton>

            {/* Kullanıcı Giriş Durumuna Göre Butonlar */}
            {!isLoggedIn ? (
              <>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setIsLoginOpen(true)}
                  sx={{ marginRight: 1 }}
                >
                  {t('login_button')}
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setIsRegisterOpen(true)}
                >
                 {t('register_button')}
                </Button>
              </>
            ) : (
              <>
                <Box   
                  sx={{
                   display: 'flex',
                   flexDirection: 'column',
                    alignItems: 'center',  // <-- bunlar yatayda ortalar
                    marginRight: 2
                  }}
                >
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  Hoş Geldiniz
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  {username}
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleLogout}
                  sx={{ marginLeft: 1 }}  // Araya biraz boşluk
                >
                {t('logout_button')}
                </Button>
              </>
            )}
          </Box>

          {/* ==============================
          13. MapComponent Bileşeni
          ============================== */}
          <MapComponent
            isLoggedIn={isLoggedIn}
            userRole={userRole}
            userToken={userToken}
            startPoint={startPoint}
            endPoint={endPoint}
            transportMode={transportMode}
            setStartPoint={setStartPoint} // Yeni eklendi
            setEndPoint={setEndPoint}  
            selectionMode={selectionMode}
            onMapSelection={handleMapSelection}
            searchResults={searchResults}
            setSnackbar={setSnackbar}
            selectedBirim={selectedBirim}
            setSelectedBirim={setSelectedBirim}
            setSearchResults={setSearchResults}  
            routeTrigger={routeTrigger}
            onRouteDistance={(d) => setRouteDistance(d)} // Rota tetikleyicisini geçir
          />

          {/* ==============================
          14. Birimler Paneli
          ============================== */}
          {isBirimlerOpen && (
            <Birimler
              isLoggedIn={isLoggedIn}
              userRole={userRole}
              userToken={userToken}
              onSelectBirim={handleBirimSelect}
              onClose={() => setIsBirimlerOpen(false)}
              refreshTrigger={refreshTrigger} // Refresh tetikleyici prop
            />
          )}

          {/* ==============================
          15. Login ve Register Formları
          ============================== */}
          <LoginForm
            open={isLoginOpen}
            handleClose={() => setIsLoginOpen(false)}
            onLoginSuccess={handleLoginSuccess}
          />
          <RegisterForm
            open={isRegisterOpen}
            handleClose={() => setIsRegisterOpen(false)}
          />

          {/* ==============================
          16. Snackbar (Bildirim) Bileşeni
          ============================== */}
          <Snackbar
            open={snackbar.open}
            autoHideDuration={9000}
            onClose={handleCloseSnackbar}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Box>
      </Box>
    </ErrorBoundary>
  );
}

export default App;
