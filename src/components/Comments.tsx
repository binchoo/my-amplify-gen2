import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Container,
  Header,
  SpaceBetween,
} from "@cloudscape-design/components";
import { generateClient } from 'aws-amplify/data';
import { Schema } from '../../amplify/data/resource';
import { CommentForm } from './CommentForm';
import { Comment, NoComment } from './CommentItem';

const client = generateClient<Schema>();

export interface Comment {
  id: string;
  classId: string;
  content: string;
  owner: string;
  createdAt: string;
  updatedAt: string;
  _version: number;
}

export interface ActiveComment {
  id: string;
  type: 'edit' | 'reply';
}

interface CommentsProps {
  classId: string;
}

export function Comments({ classId }: CommentsProps) {
  const [comments, setComments] = useState<any[]>([]);
  const [activeComment, setActiveComment] = useState<{
    id: string;
    type: string;
  } | null>(null);

  const fetchComments = useCallback(async () => {
    const { data: items, errors } = await client.models.Comment.list({
      filter: { classId: { eq: classId } }
    });
    if (errors) {
      console.error('Error fetching comments:', errors);
    } else {
      setComments(items);
    }
  }, [classId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const createCommentApi = useCallback(async (post: string, classId: string) => {
    const { errors, data: newComment } = await client.models.Comment.create({
      classId: classId,
      content: post,
    });
    if (!errors && newComment) {
      setComments(prevComments => [...prevComments, newComment]);
    }
  }, []);

  const editCommentApi = useCallback(async (
    commentId: string, 
    commentVersion: number, 
    post: string
  ) => {
    const updatedPost = {
      id: commentId,
      content: post,
      _version: commentVersion,
    };
    const { data: updatedComment, errors } = await client.models.Comment.update(updatedPost);
    if (errors) {
      console.error('Error updating comment:', errors);
    } else {
      console.log('Updated comment:', updatedComment);
      await fetchComments();
    }
  }, [fetchComments]);

  const deleteCommentApi = useCallback(async (
    commentId: string, 
    commentVersion: number
  ) => {
    const toBeDeletedComment = {
      id: commentId,
      _version: commentVersion,
    };
    const { data: deletedComment, errors } = await client.models.Comment.delete(toBeDeletedComment);
    if (errors) {
      console.error('Error deleting comment:', errors);
    } else {
      console.log('Deleted comment:', deletedComment);
      await fetchComments();
    }
  }, [fetchComments]);

  return (
    <Container header={<Header variant='h3'>Comments</Header>}>
      <Box float='center'>
        <SpaceBetween size="xl">
          <CommentForm 
            classId={classId} 
            createCommentApi={createCommentApi}
            editCommentApi={editCommentApi}  
            activeComment={activeComment} 
            setActiveComment={setActiveComment}
          />
          <SpaceBetween size="xs">
            {comments.length > 0 ? (
              comments
                .filter(comment => comment.classId === classId)
                .sort((a, b) => b.createdAt.localeCompare(a.updatedAt))
                .map(comment => (
                  <Comment
                    key={comment.id}
                    comment={comment}
                    activeComment={activeComment}
                    setActiveComment={setActiveComment}
                    editCommentApi={editCommentApi}
                    deleteCommentApi={deleteCommentApi}
                  />
                ))
            ) : (
              <NoComment />
            )}
          </SpaceBetween>
        </SpaceBetween>
      </Box>
    </Container>
  );
}