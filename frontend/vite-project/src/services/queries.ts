import { gql } from "@apollo/client";

export const BLOGS_QUERY = gql`
    query Query {
      Blogs {
        _id
        ProjectName
        Describtion
        image
        createdAt
        totalComment
        totalViews
      }
    }
  `;

export const LOGOUT_QUERY = gql`
  query Logout {
    clearcookie
  }
`;

export const COMMENTS_QUERY = gql`
  query Query($blogId: String!) {
    getCurrentUserComment(BlogID: $blogId) {
      _id
      Comment
      createdAt
      UserComment {
        _id
        email
        username
      }
    }
  }
`;



export const LoginQl = gql`
        mutation Mutation($email: String!, $password: String!) {
            Login(email: $email, password: $password)
            }
      `;

    
export const CURRENT_BLOGS_QUERY = gql`
    query Query($id: String!) {
      CurrentBlog(_id: $id) {
        ProjectName
        Describtion
        GithubLink
        image
        BlogOwner {
          _id
          username
        }
        ProjectLink
        createdAt
      }
    }
  `;


export const viewCounter = gql`
   query Query($getViewsId: String!) {
      getViews(id: $getViewsId) {
        projecturlClickHistory {
          timestamps
        }
        giturlClickHistory {
          timestamps
        }
      }
    }
  `;

export const ME_QUERY = gql`
  query GetCurrentUser {
    getCurrentUser {
      _id
      username
      email
      Role
      Isbaned
      Status
      createdAt
      updatedAt
    }
  }
`;


export const DASHBOARAD_QUARY = gql`
  query BlogDashboard {
  BlogDashboard {
    _id
    ProjectName
    createdAt
    BlogViews {
      timestamps
      user {
        _id
      }
    }
  }
}
`;


export const GETAllUser = gql`
  query Query {
  users {
    createdAt
    email
    updatedAt
    username
    _id
    Role
    Isbaned
  }
}
`;


export const CHECK_SIGNUP_STATUS = gql`
  query CheckSignupStatus($email: String!) {
    checkSignupStatus(email: $email) {
      exists
      verified
    }
  }
`;


