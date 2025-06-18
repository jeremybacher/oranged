import React, { useState, useEffect, useCallback, memo } from "react";
import { Box, TextField } from "@mui/material";
import { decode as base64_decode, encode as base64_encode } from "base-64";

const Notes = memo(() => {
  const [note, setNote] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadNote = async () => {
      try {
        const result = await new Promise<{ note?: string }>((resolve) => {
          chrome.storage.sync.get(["note"], (result) => {
            resolve(result);
          });
        });
        
        const receivedNote = result.note
          ? JSON.parse(base64_decode(result.note))
          : "";
        setNote(receivedNote);
      } catch (error) {
        console.error('Failed to load note:', error);
        setNote("");
      } finally {
        setIsLoading(false);
      }
    };

    loadNote();
  }, []);

  const handleNoteChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = event.target.value;
    setNote(value);
    
    // Debounce saving to storage
    const timeoutId = setTimeout(() => {
      try {
        chrome.storage.sync.set({
          note: base64_encode(JSON.stringify(value)),
        });
      } catch (error) {
        console.error('Failed to save note:', error);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, []);

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '70vh',
          color: 'text.secondary',
        }}
      >
        Loading...
      </Box>
    );
  }

  return (
    <Box
      sx={(theme) => ({
        bgcolor: theme.palette.background.paper,
        mb: 2,
        display: "flex",
        flexDirection: "column",
        height: "70vh",
        maxWidth: "100%",
        borderRadius: 1,
        p: 1,
      })}
    >
      <TextField
        id="note"
        placeholder="Start typing your notes here..."
        value={note}
        onChange={handleNoteChange}
        multiline
        fullWidth
        variant="standard"
        inputProps={{
          style: {
            width: "100%",
            height: "100%",
            position: "absolute",
            top: 0,
            left: 0,
          },
        }}
        InputProps={{
          rows: note ? note.split("\n").length : 1,
          multiline: true,
          inputComponent: "textarea",
          autoComplete: "off",
          disableUnderline: true,
          style: {
            width: "100%",
            height: "100%",
          },
        }}
        style={{
          width: "100%",
          height: "100%",
        }}
      />
    </Box>
  );
});

Notes.displayName = 'Notes';

export default Notes;
