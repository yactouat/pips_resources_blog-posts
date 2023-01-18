import getPostMeta from "./get-post-meta";

const postIsMoreRecent = (
  post1Contents: string,
  post2Contents: string
): boolean => {
  try {
    // get the metadata of the first post
    const post1Meta = getPostMeta(post1Contents);
    // get the metadata of the second post
    const post2Meta = getPostMeta(post2Contents);
    return Date.parse(post1Meta.date) > Date.parse(post2Meta.date);
  } catch (error) {
    console.error(error);
    throw new Error("wrong input metadata");
  }
};

export default postIsMoreRecent;
