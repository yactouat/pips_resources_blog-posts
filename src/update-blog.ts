const updateBlog = async () => {
  console.log("Updating blog...");
  // TODO run `getBlog` to populate the local filesystem with the latest blog posts and images from the GCP bucket
  // TODO list blog posts obtained from the GCP in an array
  // TODO add local images to an array of images to create if they dont exist on either the public or private GCP buckets for images (depending on whether they are draft or published blog posts associated images)
  // TODO create each image from the array of images to create in the right directory on the right GCP bucket (wheter associated with published or draft post) + verify that the images were created
  // TODO add local blog posts to an array of blog posts to create if they are not already in the fetched blog array
  // TODO add local blog posts to an array of blog posts to update if their date differs from the GCP bucket copy for the same file and is more recent than the latter
  // TODO create each blog post from the array of blog posts to create in the right directory on the GCP bucket + verify that the blog posts were created
  // TODO update each blog post from the array of blog posts to update in the right directory on the GCP bucket + verify that the blog posts were updated
  // TODO change api.yactouat.com so that it only fetches blog posts from the `published` folder of the GCP bucket
  // TODO trigger a new build of the NextJS website
};

updateBlog();
