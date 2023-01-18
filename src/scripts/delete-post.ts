const deletePost = async (slug: string) => {
  console.log("deleting blog post...");
  // TODO find the blog post to delete in the GCP bucket in either the `drafts` or `published` folder
  // TODO verify that the blog post to delete exists in the GCP bucket
  // TODO delete the blog post from the GCP bucket if it exists
};

// TODO call `deletePost` with the slug of the blog post to delete from the command line arguments
