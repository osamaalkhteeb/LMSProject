import React from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography
} from "@mui/material";
import {
  VideoLibrary as VideoIcon,
  InsertDriveFile as FileIcon,
  Quiz as QuizIcon
} from "@mui/icons-material";

const CourseDialog = ({
  openDialog,
  handleDialogClose,
  dialogType,
  currentCourse
}) => {
  return (
    <Dialog open={openDialog} onClose={handleDialogClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {dialogType === "create" && "Create New Course"}
        {dialogType === "edit" && `Edit Course: ${currentCourse?.title}`}
        {dialogType === "publish" && `${currentCourse?.is_published ? "Unpublish" : "Publish"} Course`}
        {dialogType === "delete" && "Delete Course"}
      </DialogTitle>
      <DialogContent>
        {dialogType === "delete" ? (
          <Typography>
            Are you sure you want to delete "{currentCourse?.title}"? This action cannot be undone.
          </Typography>
        ) : dialogType === "publish" ? (
          <Typography>
            {currentCourse?.is_published 
              ? "Are you sure you want to unpublish this course? Students will no longer be able to access it."
              : "Publish this course to make it available to students."}
          </Typography>
        ) : (
          <Box component="form" sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Course Name"
              defaultValue={dialogType === "edit" ? currentCourse?.title : ""}
              autoFocus
            />
            <TextField
              margin="normal"
              fullWidth
              label="Description"
              multiline
              rows={4}
              defaultValue={dialogType === "edit" ? currentCourse?.description : ""}
            />
            <TextField
               margin="normal"
               fullWidth
               label="Category"
               defaultValue={dialogType === "edit" ? currentCourse?.category_name : ""}
               sx={{ mt: 2 }}
             />
            <Box display="flex" gap={2} mt={2}>
              <Button
                variant="contained"
                component="label"
                startIcon={<VideoIcon />}
              >
                Upload Video
                <input type="file" hidden accept="video/*" />
              </Button>
              <Button
                variant="contained"
                component="label"
                startIcon={<FileIcon />}
              >
                Upload PDF
                <input type="file" hidden accept=".pdf" />
              </Button>
              <Button
                variant="contained"
                component="label"
                startIcon={<QuizIcon />}
              >
                Add Quiz
                <input type="file" hidden accept=".json,.xml" />
              </Button>
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleDialogClose}>Cancel</Button>
        <Button 
          onClick={handleDialogClose} 
          variant="contained"
          color={dialogType === "delete" ? "error" : "primary"}
        >
          {dialogType === "create" && "Create Course"}
          {dialogType === "edit" && "Save Changes"}
          {dialogType === "publish" && (currentCourse?.is_published ? "Unpublish" : "Publish")}
          {dialogType === "delete" && "Delete"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CourseDialog;