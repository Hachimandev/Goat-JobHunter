export const formatComments = (flatComments: any[]) => {
  const map = new Map();
  const roots: any[] = [];

  flatComments.forEach(comment => {
    map.set(comment.id, { ...comment, replies: [] });
  });

  flatComments.forEach(comment => {
    const node = map.get(comment.id);
    if (comment.parentId) {
      const parent = map.get(comment.parentId);
      if (parent) {
        parent.replies.push(node);
      }
    } else {
      roots.push(node);
    }
  });

  return roots;
};