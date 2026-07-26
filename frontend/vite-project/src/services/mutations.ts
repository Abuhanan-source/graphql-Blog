import { gql } from "@apollo/client";

export const CREATE_BLOG_MUTATION = gql`
    mutation Mutation($projectName: String!, $describtion: String!, $projectLink: String!, $githubLink: String!, $image: String) 
    {
      CreateCards(ProjectName: $projectName, Describtion: $describtion, ProjectLink: $projectLink, GithubLink: $githubLink, image: $image)
    }
  `;


export const ADD_COMMENT_MUTATION = gql`
  mutation Mutation($comment: String!, $blogOwner: String!) {
    UserComment(Comment: $comment, BlogOwner: $blogOwner)
  }
`;


 export const EmailMutation = gql`
     mutation Mutation($otp: String!, $email: String!) {
      emailVerified(otp: $otp, email: $email)
    }
    `;


export const userSignup = gql`
    mutation Mutation($username: String!, $email: String!, $password: String!) {
      SignUp(username: $username, email: $email, password: $password)
    }
  `;


export const linkQuery = gql`
    mutation incrementgithublinkview($link: String!) {
      GitTotalCount(link: $link)
    }
  `;

export const projectQuery = gql`
    mutation incrementprojectlinkview($link: String!) {
      projecturlClickHistory(link: $link)
    }
  `;

export const UPDATEBLOGCARDS = gql`
mutation Mutation($projectName: String!, $describtion: String!, $projectLink: String!, $githubLink: String!,$image: String, $blogid: String!) {
  UpdateBlog(ProjectName: $projectName, Describtion: $describtion, ProjectLink: $projectLink, GithubLink: $githubLink, Blogid: $blogid,image: $image)
}
`;

export const DELETEBLOG = gql`
mutation DeleteUserBlog($blogId: String!) {
  DeleteUserBlog(BlogID: $blogId)
}
`;

export const ResendOtpMutation = gql`
mutation Mutation($email: String!) {
  resendOtp(email: $email)
}
`;


