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
  - read and create/update the blog posts Markdown files in a dedicated private GCP storage bucket
  - persist the blog posts associated images in a dedicated GCP storage bucket
    - if the image is associated to a published post, it will be sent to a public GCP storage bucket dedicated to images
    - if the image is associated to a draft post, it will be sent to the private blog posts GCP storage bucket
  - trigger my NextJS app to rebuild and redeploy (as I've chosen static site generation for faster loading times and better SEO)

I use `gray-matter` to give metadata to my blog posts, this is how a blog post should be formatted =>

```
---
date: "2020-01-01"
slug: "blog-post"
title: "blog post"
---

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc ut lobortis leo. Phasellus aliquet velit ut sagittis tempor. Aliquam nisl velit, semper eu laoreet at, mollis id enim. Donec auctor accumsan enim vitae placerat. Morbi lacinia arcu nec lacus rhoncus aliquet. Duis imperdiet arcu justo, ac pulvinar elit imperdiet at. Duis id velit nisl.
```

there is no need to add an h1 title in the markdown file, as the title will be used as the h1 tag on blog site build

! make sure the slug of the blog posts is unique and matches the name of the markdown file

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
