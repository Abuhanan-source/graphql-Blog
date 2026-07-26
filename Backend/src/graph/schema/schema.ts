export const schema = `#graphql

  type User {
    _id:ID!
    username: String!
    email: String!
    Role: String!
    Isbaned:Boolean
    Status:Boolean
    createdAt: String!
    updatedAt: String!
  }
    
  type BlogView {
  user: User!
  timestamps: String!
}


type SignupStatus {
  exists: Boolean!
  verified: Boolean!
}
  

  type ProjectCards {
    _id:ID!
    ProjectName:String!
    Describtion: String!
    ProjectLink: String!
    GithubLink: String!
    image: String
    BlogOwner: User
    BlogViews:[BlogView]
    totalViews: Int!
    createdAt: String!
    updatedAt: String!
    totalComment: Int
  }

  type UserComment {
    _id:ID!
    Comment: String!
    UserComment: User
    BlogOwner: ProjectCards!
    createdAt: String!
  }

  type ClickHistoryRecord {
    timestamps: Float! 
  }

  type Views {
     projecturlClickHistory: [ClickHistoryRecord!]!
    giturlClickHistory: [ClickHistoryRecord!]!
  }


  type Query {
    users:[User]
    Blogs:[ProjectCards]
    getCurrentUser: User
    CurrentBlog(_id:String!):ProjectCards
    clearcookie:String!
    UserCreatedBlog:[ProjectCards]
    getCurrentUserComment(BlogID:String!):[UserComment]
    getViews(id: String!): Views!
    BlogDashboard:[ProjectCards]
    checkSignupStatus(email: String!): SignupStatus!
  }

  type UserComment {
  _id: ID!
  Comment: String!
  UserComment: User!
  BlogOwner: ProjectCards!
  createdAt: String!
}



  type Mutation {
  SignUp (username: String!, email: String!, password: String!): String!

  Login (email: String!, password: String!): String!

  CreateCards(ProjectName:String!,Describtion: String!,ProjectLink: String!,GithubLink: String!,image: String):String!
  
  UpdateBlog(ProjectName:String!,Describtion: String!,ProjectLink: String!,GithubLink: String!,image: String, Blogid:String!):String!

  emailVerified(otp:String!,email:String!):String!

  UserComment(Comment:String!,BlogOwner:String!):String!

  GitTotalCount(link:String!):String!

  projecturlClickHistory(link:String!):String!

  DeleteUserBlog(BlogID:String!):String!

  UpdateUserRole(userId: String!, Role: String!) : String!

  UpdateBanedStatus(userId: String!, Baned: Boolean!): String!

  CommentDeleted(CommentId: String!): String!

  resendOtp(email: String!): String!

  }
 
`;


