export function request(ctx) {
    const prompt = ctx.args.prompt;
  
    return {
      resourcePath: `/model/anthropic.claude-3-5-sonnet-20240620-v1:0/invoke`,
      method: "POST",
      params: {
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          anthropic_version: "bedrock-2023-05-31",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: prompt,
                },
              ],
            },
          ],
          max_tokens: 1000,
          temperature: 0.5,
        },
      },
    };
  }
  
  export function response(ctx) {
    return {
      body: ctx.result.body,
    };
  }