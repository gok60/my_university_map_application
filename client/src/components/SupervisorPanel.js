// ========== src/components/SupervisorPanel.js ==========
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from './config';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';

export default function SupervisorPanel({ userToken, onLogout }) {
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [hatalar, setHatalar] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [loadingHatalar, setLoadingHatalar] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const authHeaders = { headers: { Authorization: `Bearer ${userToken}` } };

  // --- Data fetchers ---
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await axios.get(`${API_URL}/users`, authHeaders);
      setUsers(res.data);
    } catch (err) {
      setSnackbar({ open: true, message: 'Kullanıcıları çekerken hata.', severity: 'error' });
    } finally { setLoadingUsers(false); }
  };
  const fetchEvents = async () => {
    setLoadingEvents(true);
    try {
      const res = await axios.get(`${API_URL}/events`, authHeaders);
      setEvents(res.data);
    } catch { setSnackbar({ open: true, message: 'Etkinlikleri çekerken hata.', severity: 'error' }); }
    finally { setLoadingEvents(false); }
  };
  const fetchHatalar = async () => {
    setLoadingHatalar(true);
    try {
      const res = await axios.get(`${API_URL}/hatalar`, authHeaders);
      setHatalar(res.data);
    } catch { setSnackbar({ open: true, message: 'Hataları çekerken hata.', severity: 'error' }); }
    finally { setLoadingHatalar(false); }
  };

  useEffect(() => {
    fetchUsers();
    fetchEvents();
    fetchHatalar();
  }, []);

  // --- Handlers ---
  const handleVerify = async (id) => {
    try {
      await axios.put(`${API_URL}/users/${id}/verify`, {}, authHeaders);
      setUsers(us => us.map(u => u.id === id ? { ...u, is_verified: true } : u));
      setSnackbar({ open: true, message: 'Kullanıcı onaylandı.', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Onaylama hatası.', severity: 'error' });
    }
  };
  const handleUnverify = async (id) => {
    try {
      await axios.put(`${API_URL}/users/${id}/unverify`, {}, authHeaders);
      setUsers(us => us.map(u => u.id === id ? { ...u, is_verified: false } : u));
      setSnackbar({ open: true, message: 'Onay kaldırıldı.', severity: 'info' });
    } catch {
      setSnackbar({ open: true, message: 'Onay kaldırma hatası.', severity: 'error' });
    }
  };

  const handleCloseSnackbar = () => setSnackbar(s => ({ ...s, open: false }));

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">Supervisor Panel</Typography>
        <Box>
          <Button onClick={() => { fetchUsers(); fetchEvents(); fetchHatalar(); }} sx={{ mr: 1 }}>Yenile</Button>
          <Button color="error" variant="contained" onClick={onLogout}>Çıkış Yap</Button>
        </Box>
      </Box>

      {/* Kullanıcı Tablosu */}
      <Paper sx={{ mb: 4, p: 2 }}>
        <Typography variant="h6" mb={1}>Kullanıcılar</Typography>
        {loadingUsers ? (
          <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Ad</TableCell>
                <TableCell>Soyad</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Öğrenci No</TableCell>
                <TableCell>Rol</TableCell>
                <TableCell>Topluluk</TableCell>
                <TableCell>Onay</TableCell>
                <TableCell align="right">İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map(u => (
                <TableRow key={u.id}>
                  <TableCell>{u.name}</TableCell>
                  <TableCell>{u.surname}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{u.student_no}</TableCell>
                  <TableCell>
                    <Select
                      value={u.role}
                      size="small"
                      onChange={e => {
                        axios.put(`${API_URL}/users/${u.id}/role`, { role: e.target.value }, authHeaders)
                          .then(() => {
                            setUsers(us => us.map(x => x.id === u.id ? { ...x, role: e.target.value } : x));
                            setSnackbar({ open: true, message: 'Rol güncellendi.', severity: 'success' });
                          }).catch(() => setSnackbar({ open: true, message: 'Rol güncelleme hatası.', severity: 'error' }));
                      }}
                    >
                      <MenuItem value="normal">Normal</MenuItem>
                      <MenuItem value="admin">Admin</MenuItem>
                      <MenuItem value="supervisor">Supervisor</MenuItem>
                    </Select>
                  </TableCell>
                  <TableCell>{u.community}</TableCell>
                  <TableCell>{u.is_verified ? '✅' : '❌'}</TableCell>
                  <TableCell align="right">
                    {u.is_verified ? (
                      <Button size="small" onClick={() => handleUnverify(u.id)} sx={{ mr: 1 }}>Onayı Kaldır</Button>
                    ) : (
                      <Button size="small" onClick={() => handleVerify(u.id)} sx={{ mr: 1 }}>Onayla</Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      {/* Eklenen Etkinlikler */}
      <Paper sx={{ mb: 4, p: 2 }}>
        <Typography variant="h6" mb={1}>Eklenen Etkinlikler</Typography>
        {loadingEvents ? (
          <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Başlık</TableCell>
                <TableCell>Tarih</TableCell>
                <TableCell>Oluşturan</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {events.map(ev => (
                <TableRow key={ev.id}>
                  <TableCell>{ev.title}</TableCell>
                  <TableCell>{ev.date}</TableCell>
                  <TableCell>{ev.creator_name} {ev.creator_surname}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      {/* Eklenen Hatalar */}
      <Paper sx={{ mb: 4, p: 2 }}>
        <Typography variant="h6" mb={1}>Eklenen Hatalar</Typography>
        {loadingHatalar ? (
          <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Hata Türü</TableCell>
                <TableCell>Açıklama</TableCell>
                <TableCell>Oluşturan</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {hatalar.map(h => (
                <TableRow key={h.id}>
                  <TableCell>{h.hata_turu}</TableCell>
                  <TableCell>{h.aciklama}</TableCell>
                  <TableCell>{h.creator_name} {h.creator_surname}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
