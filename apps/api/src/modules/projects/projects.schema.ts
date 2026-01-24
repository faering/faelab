export const projectSchema = {
  response: {
    200: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id', 'title'],
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          imageUrl: { type: 'string' },
        },
      },
    },
  },
};
