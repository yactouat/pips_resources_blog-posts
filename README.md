# pips_resources_blog-posts

<!-- TOC -->

- [pips_resources_blog-posts](#pips_resources_blog-posts)
  - [what is this ?](#what-is-this-)
  - [pre requisites](#pre-requisites)
  - [Contribution guidelines](#contribution-guidelines)
  - [Contributors](#contributors)

<!-- /TOC -->

## what is this ?

the automation behind my personal blogging service, this works as follows:

- I get all my blog posts from a GCP storage bucket with `npm run get-blog`, this populates the `./blog` folder
- I write markdown blog posts in either `./blog/draft-posts` or `./blog/published-posts` folders
- I can run `npm run update-blog` to
  - create, read, and update the blog posts Markdown files in a dedicated private GCP storage bucket
  - create, read, and update the blog posts associated images in a dedicated GCP storage bucket
    - if the image is associated to a published post, it will be accessible via `cdn.yactouat.com`, which points a public GCP storage bucket
    - if the image is associated to a draft post, it will be sent to a private GCP storage bucket dedicated to images
  - trigger my NextJS app to rebuild and redeploy (as I've chosen static site generation for faster loading times and better SEO)
- I can run `npm run delete-blog-post SLUG` (where `SLUG` is the slug of the blog post) to delete a blog post from the local file system as well as from the GCP bucket, whether it's a draft or a published one

I use `gray-matter` to give metadata to my blog posts

## pre requisites

- [Node.js](https://nodejs.org/en/)
- [Typescript](https://www.typescriptlang.org/)
- a Google Cloud Platform (GCP) project
- have your Google default application credentials set up on your machine
- you must have the `gcloud` CLI installed and configured to your GCP project (`gcloud init` if it's not the case)
- it's nice to have a domain name for your blog
- you will need 2 GCP storage buckets
  - a private one for the blog posts
  - a public one for the images
    - you can a CDN to this bucket for your images, if you want to
- a NextJS app that uses the blog posts from the cloud storage bucket, either directly or via a CDN or an external API etc.
- you must create a `.env` file based on the `.env.example` file
- you can install the dependencies with `npm install`

## Contribution guidelines

dear past, present, and future contributors, you have my many thanks, but please follow these guidelines:

- please use comments to explain your code, even if it's obvious to you, it might not be to someone else
- you are free to arrange the code, the folder structure, the file names, etc. as you see fit if you're able to provide a good reason for it

that's all, thank you for your time !

## Contributors

a big thanks goes to the contributors of this project:

<table>
<tbody>
    <tr>
        <td align="center"><a href="https://github.com/yactouat"><img src="https://avatars.githubusercontent.com/u/37403808?v=4" width="100px;" alt="yactouat"/><br /><sub><b>Yactouat</b></sub></a><br /><a href="https://github.com/yactouat"></td>
    </tr>
</tbody>
</table>
