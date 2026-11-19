export const queryKeys = {
  posts: ["posts"],
  postList: (params) => ["posts", "list", params],
  post: (id) => ["posts", "detail", id],
  calendar: ["calendar"],
  dashboard: ["dashboard"],
  accounts: ["accounts"],
  analytics: ["analytics"],
};
export async function invalidatePosts(client) {
  await Promise.all(
    [
      queryKeys.posts,
      queryKeys.calendar,
      queryKeys.dashboard,
      queryKeys.accounts,
      queryKeys.analytics,
    ].map((queryKey) => client.invalidateQueries({ queryKey })),
  );
}
