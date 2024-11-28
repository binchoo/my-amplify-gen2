export function request(ctx) {
    const system = JSON.parse(ctx.args.system) || [{ text: "You are a friendly AI assistant" }];
    const messages = JSON.parse(ctx.args.messages) || [];
  
    return {
      resourcePath: `/model/anthropic.claude-3-5-sonnet-20240620-v1:0/converse`,
      method: "POST",
      params: {
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          system,
          messages,
          inferenceConfig: {
            maxTokens: 4096,
            temperature: 0.5
          }
        },
      },
    };
  }
  
  export function response(ctx) {
    return {
      body: ctx.result.body,
    };
  }