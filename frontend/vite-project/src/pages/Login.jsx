import { useState } from "react";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Stack,
} from "@mui/material";
import { login } from "../api/api";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSignIn = async () => {
    setError(false);
    setErrorMsg("");

    if (!username.trim() || !password.trim()) {
      setError(true);
      setErrorMsg("Please fill in both fields.");
      return;
    }

    try {
      const user = await login(username.trim(), password.trim());
      onLogin(user);
    } catch (e) {
      setError(true);
      setErrorMsg("Invalid username or password.");
      console.error(e);
    }
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
            error={error}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <TextField
            label="Password"
            type="password"
            variant="outlined"
            fullWidth
            error={error}
            helperText={error ? errorMsg : ""}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button
            variant="contained"
            size="large"
            onClick={handleSignIn}
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
