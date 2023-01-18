import matter from "gray-matter";

import { PostMetaData } from "./PostMetaData";

const getPostMeta = (postContents: string): PostMetaData => {
  // Use gray-matter to parse the post metadata section
  const meta = matter(postContents);
  if (
    meta.data.date == undefined ||
    meta.data.slug == undefined ||
    meta.data.title == undefined
  ) {
    throw new Error("post metadata is missing");
  }
  // Combine the metadata with the slug
  return {
    date: meta.data.date,
    slug: meta.data.slug,
    title: meta.data.title,
  };
};

export default getPostMeta;
