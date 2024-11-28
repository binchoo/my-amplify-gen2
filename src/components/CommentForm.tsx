import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  Form,
  Grid,
  Modal,
  SpaceBetween,
  Textarea,
} from "@cloudscape-design/components";
import LoadingBar from "@cloudscape-design/chat-components/loading-bar";
import { generateClient } from 'aws-amplify/data';
import { Schema } from '../../amplify/data/resource';
import { NewLineToBr } from './utils/NewLineToBr';

const client = generateClient<Schema>();


export const CommentForm = ({
  initText = '',
  classId,
  commentId,
  commentVersion,
  activeComment,
  setActiveComment,
  createCommentApi,
  editCommentApi,
}) => {
  const [post, setPost] = useState(initText);
  const [alertVisible, setAlertVisible] = useState(false);
  const [summary, setSummary] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const submitHandler = async (event) => {
    event.preventDefault();
    if (post.replace(/\s/g, '').length > 0) {
      if (activeComment && activeComment.type === "edit") {
        await editCommentApi(commentId, commentVersion, post);
        setActiveComment(null);
      } else {
        await createCommentApi(post, classId);
        setPost("");
      }
    } else {
      setAlertVisible(true);
    }
  };

  const cancelHandler = () => {
    activeComment && activeComment.type === "edit" ? setActiveComment(null) : setPost("");
  }

  const askBedrock = async (prompt: string) => {
    const response = await client.queries.askBedrock({ prompt: prompt });
    const res = JSON.parse(response.data?.body!);
    const content = res.content[0].text;
    return content || null;
  };

  const generateSummarization = async (e: any) => {
    setIsGenerating(true);
    console.log("Generating summarization...");
    
    try {
      const { data: commentItems, errors } = await client.models.Comment.list({
        filter: { classId: { eq: classId } }
      });

      if (errors) {
        console.error('Error fetching comments:', errors);
        return;
      }

      let allComments = [...commentItems];
      if (post.trim()) {
        allComments = [...allComments, { content: post }];
      }

      if (!allComments || allComments.length === 0) {
        console.log("No comments to summarize");
        setSummary("No comments available to summarize.");
        return;
      }

      const commentsText = allComments
        .map(comment => comment.content)
        .join("\n");

      const prompt = `📊 Summarize the following comments in a structured format:

      ${commentsText}

      Format your response as follows:

      📚 Summary:
      [Provide a concise summary of the overall sentiment and main points]

      ⭐️ Overall Score : [_/5]

      💫 Key Reason:
      [Main reason for the score]`;

      const response = await askBedrock(prompt);
      console.log("Bedrock response:", response);
      setSummary(response);

    } catch (error) {
      console.error("Error in generateSummarization:", error);
      setSummary("An error occurred while generating the summary.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <form onSubmit={submitHandler}>
      <Form>
        <SpaceBetween size="m">
          {/* Summarize Section */}
          <Box>
            <Button 
              formAction="none" 
              onClick={generateSummarization}
              iconName="gen-ai"
              disabled={isGenerating}
              loading={isGenerating}
            >
              Summarize
            </Button>
          </Box>
          
          {isGenerating && (
            <Container>
              <Box
                margin={{ bottom: "xs", left: "l" }}
                color="text-body-secondary"
              >
                Generating summary
              </Box>
              <LoadingBar variant="gen-ai" />
            </Container>
          )}

          <Box>
            <Box
              as="pre"
              padding="s"
              fontSize="body-m"
              color="text-body-secondary"
              backgroundColor="background-container"
              borderRadius="s"
              style={{
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word',
                overflowWrap: 'break-word'
              }}
            >
              <NewLineToBr>{summary || "Generated summary will appear here."}</NewLineToBr>
            </Box>
          </Box>

          <hr style={{ width: '100%', margin: '20px 0' }} />

          {/* Comment Section */}
          <Grid disableGutters gridDefinition={[{ colspan: 10 }, { colspan: 2 }]}>
            <Textarea
              placeholder="Enter your comments here."
              onChange={({ detail }) => setPost(detail.value)}
              value={post}
              rows={post.split(/\r\n|\r|\n/).length}
            />
            <Box float="right">
              <SpaceBetween direction="horizontal" size="xs">
                <Button 
                  formAction="none" 
                  iconName="undo" 
                  variant="icon" 
                  onClick={cancelHandler}
                  disabled={isGenerating}
                />
                <Button 
                  formAction="submit" 
                  iconName="upload" 
                  variant="icon"
                  disabled={isGenerating}
                />
              </SpaceBetween>
            </Box>
          </Grid>
        </SpaceBetween>

        <Modal
          onDismiss={() => setAlertVisible(false)}
          visible={alertVisible}
          closeAriaLabel="Close modal"
          size="small"
        >
          Enter a message.
        </Modal>
      </Form>
    </form>
  );
};