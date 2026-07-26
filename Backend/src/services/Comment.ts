import { GraphQLError } from "graphql";
import Cards from "../Schema/projectCardScheme/CardSchema.js";
import Comments from "../Schema/comments/BlogComment.js";

export interface CommentCreateType {
    Comment:String,
    BlogOwner: String,
}


class CommentServices {

    public static async CreateComment(CommentInfo: CommentCreateType,userID:any) {
        if(!CommentInfo.Comment){
            throw new GraphQLError("Comment is Not given!", {
            extensions: { code: 'BAD_Comment_INPUT' }
          });
        }

        if(!CommentInfo.BlogOwner){
            throw new GraphQLError("Blog ID is Not given!", {
            extensions: { code: 'BAD_Comment_INPUT' }
          });
        }

        const Comment = await Comments.create({
            Comment:CommentInfo.Comment,
            UserComment:userID,
            BlogOwner:CommentInfo.BlogOwner
        
        })

        if(!Comment){
            throw new GraphQLError("Comment did not Created Yet!", {
            extensions: { code: 'BAD_Creation_Failed' }
          });
        }

        return "Thanks For Your Comment!";
    }

    public static async getAllComment(BlogID: String,userID:any) {
        if(!BlogID){
            throw new GraphQLError("BlogID is Not given!", {
            extensions: { code: 'BAD_Comment_INPUT' }
          });
        }

        if(!userID){
            throw new GraphQLError("Your Are not Login!", {
            extensions: { code: 'BAD_Comment_INPUT' }
          });
        }

        const userComment = await Comments.find({
          BlogOwner:BlogID
        } as any).sort({ createdAt: -1 });

        if(!userComment){
            throw new GraphQLError("Comment not Found!", {
            extensions: { code: 'BAD_Creation_Failed' }
          });
        }

        return userComment;
    }

     public static async DeleteComment(CommentID: any) {
                const CounterLink = await Comments.findOne({_id:CommentID} as any);
        
                if (!CounterLink) {
                  throw new GraphQLError("Blogs Not Found!", {
                    extensions: { code: 'BAD_Not_FOUND' }
                  });
                }
        
                await CounterLink.deleteOne();

                return "Comment is Delete Successfully!"
     }


}

export default CommentServices