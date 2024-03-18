import React, { useState, useEffect } from "react";
import { Box } from "@mui/material";
import TextField from "@mui/material/TextField";
import { decode as base64_decode, encode as base64_encode } from "base-64";

const Notes = () => {
  const [note, setNote] = useState<string>("");

  useEffect(() => {
    chrome.storage.sync.get(["note"], function (result) {
      const receivedNote = result.note
        ? JSON.parse(base64_decode(result.note))
        : "";
      setNote(receivedNote);
    });
  }, []);

  return (
    <Box
      sx={(theme) => ({
        bgcolor: theme.palette.background.paper,
        mb: 2,
        display: "flex",
        flexDirection: "column",
        overflowY: "scroll",
        height: "70vh",
        width: "150vh",
      })}
    >
      <TextField
        id="note"
        hiddenLabel
        size="medium"
        variant="standard"
        placeholder="Just start typing, and the great ideas will flow..."
        value={note}
        onChange={(event: any) => {
          const value = event.target.value;
          event.target.rows = value.split("\n").length;
          chrome.storage.sync.set({
            note: base64_encode(JSON.stringify(value)),
          });
          setNote(value);
        }}
        InputProps={{
          rows: note ? note.split("\n").length : 1,
          multiline: true,
          inputComponent: "textarea",
          autoComplete: "off",
          disableUnderline: true,
        }}
      />
    </Box>
  );
};

export default Notes;
