import { useState } from "react";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Stack,
} from "@mui/material";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (!username.trim() || !password.trim()) return;

    // MOCK LOGIN – posielame späť mock user objekt
    onLogin({
      id: 1,
      username,
    });
  };

  return (
    <Box
      sx={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #6b73ff 0%, #000dff 100%)",
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: 4,
          width: 350,
          borderRadius: 3,
          textAlign: "center",
          backdropFilter: "blur(6px)",
        }}
      >
        <Typography variant="h4" fontWeight={700} mb={3}>
          Chatty
        </Typography>

        <Stack spacing={2}>
          <TextField
            label="Username"
            variant="outlined"
            fullWidth
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            label="Password"
            type="password"
            variant="outlined"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button
            variant="contained"
            size="large"
            onClick={handleLogin}
            sx={{
              mt: 1,
              borderRadius: 2,
              textTransform: "none",
              fontSize: 16,
            }}
          >
            Sign In
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
