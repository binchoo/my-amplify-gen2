import React, { useState } from 'react';
import {
  Box,
  Button,
  Modal,
  SpaceBetween,
  TextContent,
} from "@cloudscape-design/components";
import moment from 'moment';
import { NewLineToBr } from './utils/NewLineToBr';

export const NoComment = () => (
  <Box
    padding={{ bottom: "s" }}
    fontSize="heading-s"
    textAlign="center"
    color="inherit"
  >
    <b>No Contents</b>
  </Box>
);

interface CommentProps {
  comment: {
    id: string;
    content: string;
    owner: string;
    updatedAt: string;
    _version: number;
  };
  deleteCommentApi: (commentId: string, commentVersion: number) => Promise<void>;
}

export const Comment = ({
  comment,
  deleteCommentApi,
}: CommentProps) => {
  const [confirmVisible, setConfirmVisible] = useState(false);

  const deleteHandler = async () => {
    await deleteCommentApi(comment.id, comment._version);
    setConfirmVisible(false);
  }

  return (
    <>
      <TextContent>
        <h4>{comment.owner}</h4>
        <p>
          <small>{moment(comment.updatedAt).fromNow()}</small>
        </p>
      </TextContent>

      <SpaceBetween direction="horizontal" size="xxs">
        <Button 
          iconName="remove" 
          variant="icon" 
          onClick={() => setConfirmVisible(true)} 
        />
      </SpaceBetween>

      <Modal
        onDismiss={() => setConfirmVisible(false)}
        visible={confirmVisible}
        closeAriaLabel="Close modal"
        size="small"
        footer={
          <Box float="right">
            <SpaceBetween direction="horizontal" size="xs">
              <Button variant="link" onClick={() => setConfirmVisible(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={deleteHandler}>
                Confirm
              </Button>
            </SpaceBetween>
          </Box>
        }
      >
        Are you sure to delete the message?
      </Modal>
      <NewLineToBr>{comment.content}</NewLineToBr>
    </>
  );
};