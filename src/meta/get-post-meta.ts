import matter from "gray-matter";

const getPostMeta = (
  postContents: string
): {
  date: string;
  slug: string;
  title: string;
} => {
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
