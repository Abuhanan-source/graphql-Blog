import { GraphQLError } from "graphql";
import Cards from "../Schema/projectCardScheme/CardSchema.js";

export interface IBlog {
    ProjectName:String,
    Describtion: String,
    ProjectLink: String,
    GithubLink: String,
    image?: String
}


export interface IUpdateBlog {
    ProjectName:String,
    Describtion: String,
    ProjectLink: String,
    GithubLink: String,
    image?: String,
    Blogid:String | any
}

class BlogServices {
    public static async createBlog(BlogData: IBlog,user:any) {
        if(!BlogData.ProjectName || !BlogData.Describtion || !BlogData.GithubLink || !BlogData.ProjectLink){
            throw new GraphQLError("All fields are required", {
            extensions: { code: 'BAD_USER_INPUT' }
          });
        }

        const cards = await Cards.create({
            ProjectName:BlogData.ProjectName,
            Describtion:BlogData.Describtion,
            GithubLink:BlogData.GithubLink,
            ProjectLink:BlogData.ProjectLink,
            image:BlogData.image || "",
            BlogOwner:user.userId
        })

        if(!cards){
            throw new GraphQLError("Cards Not Created!", {
            extensions: { code: 'BAD_USER_INPUT' }
          });
        }

    }

    public static async specificBlog(BlogId: any,id:any) {
        if(!BlogId){
            throw new GraphQLError("BlogId Not given!", {
            extensions: { code: 'BAD_Blog_INPUT' }
          });
        }

        const blog = await Cards.findOne(
          {_id: BlogId} as any)

          if(!blog){
            throw new GraphQLError("Blog Not Found!", {
            extensions: { code: 'BAD_Blog_Get' }
          });
        }

        const alreadyViewed = blog.BlogViews.some(
        (view: any) => view.user.equals(id)
      );

        if (
            !blog.BlogOwner.equals(id) &&
            !alreadyViewed
          ) {
            blog.BlogViews.push({
              user: id,
              timestamps: Date.now(),
            });

            await blog.save();
          }


        return blog;
    }

    public static async UserCreatedBlog(BlogId: any) {
        if(!BlogId){
            throw new GraphQLError("BlogId Not given!", {
            extensions: { code: 'BAD_Blog_INPUT' }
          });
        }

        const blog = await Cards.find({BlogOwner:BlogId} as any)
        if(!blog){
            throw new GraphQLError("Blogs Not Found!", {
            extensions: { code: 'BAD_Blog_Get' }
          });
        }

        return blog;
    }

    public static async projecturlClickHistory(link: any,id:any) {
      
     const result = await Cards.updateOne(
        {
          ProjectLink: link,
          BlogOwner: { $ne: id }, // owner must NOT be the current user
        },
      {
        $push: {
          projecturlClickHistory: {
            timestamps: Date.now(),
          },
        },
      }
    );

      if (result.matchedCount === 0) {
        throw new GraphQLError("Blogs Not Found!", {
            extensions: { code: 'BAD_Not_FOUND' }
          });
      }

      if (result.modifiedCount === 0) {
        throw new GraphQLError("View Increament Problem!", {
            extensions: { code: 'BAD_Increament_Problem' }
          });
      }

        return "Thanks";
    }

    public static async GiturlClickHistory(link: any,id:any) {
      const result = await Cards.updateOne(
        {
          GithubLink: link,
          BlogOwner: { $ne: id }, // owner must NOT be the current user
        },
      {
        $push: {
          giturlClickHistory: {
            timestamps: Date.now(),
          },
        },
      }
    );
           
      
      if (result.matchedCount === 0) {
        throw new GraphQLError("Blogs Not Found!", {
            extensions: { code: 'BAD_Not_FOUND' }
          });
      }
      
    if (result.modifiedCount === 0) {
      throw new GraphQLError("View Increament Problem!", {
            extensions: { code: 'BAD_Increament_Problem' }
          });
    }
      
      return "Thanks";
    }

    public static async getViewsCounter(id: any) {
       const CounterLink = await Cards.findOne({_id:id} as any)
            if(!CounterLink){
              throw new GraphQLError("Blogs Not Found!", {
              extensions: { code: 'BAD_Not_FOUND' }
            });
            }
            
             return {
              projecturlClickHistory :CounterLink.projecturlClickHistory,
              giturlClickHistory :CounterLink.giturlClickHistory
             }
    }

    public static async dashboarduserBlog(id: any) {
      
        const DashboardBlog = await Cards.find({BlogOwner:id} as any)

        if(!DashboardBlog){
             throw new GraphQLError("Blogs Not Found!", {
            extensions: { code: 'BAD_Not_FOUND' }
          });
        }

        return DashboardBlog
    }

    public static async updateBlog(BlogData: IUpdateBlog,id:any) {
        if(!BlogData.ProjectName || !BlogData.Describtion || !BlogData.GithubLink || !BlogData.ProjectLink){
            throw new GraphQLError("All fields are required", {
            extensions: { code: 'BAD_USER_INPUT' }
          });
        }


        const blog = await Cards.findOne({_id: BlogData.Blogid} as any)

        if(!blog){
            throw new GraphQLError("Blog not Found!", {
            extensions: { code: 'BAD_USER_INPUT' }
          });
        }

        if (blog.BlogOwner.toString() !== id.toString()) {
            throw new GraphQLError("You can't update this content!", {
              extensions: { code: "BAD_USER_INPUT" },
            });
          }

        blog.ProjectName = BlogData.ProjectName
        blog.Describtion = BlogData.Describtion
        blog.GithubLink = BlogData.GithubLink
        blog.ProjectLink = BlogData.ProjectLink
        blog.image = BlogData.image || "",

        await blog.save();


        

    }

     public static async DeleteBlog(id: any, ownerID: any, isAdmin: boolean = false) {
        const filter = isAdmin ? { _id: id } : { _id: id, BlogOwner: ownerID };
        const CounterLink = await Cards.findOne(filter as any);

        if (!CounterLink) {
          throw new GraphQLError("Blogs Not Found!", {
            extensions: { code: 'BAD_Not_FOUND' }
          });
        }

        await CounterLink.deleteOne();

        return "Delete Successfully!";
    }

    public static async GetAllBlog() {
        const Blog = await Cards.find();

        if(!Blog){
            throw new GraphQLError("Blogs Not Found!", {
              extensions: { code: 'BAD_Not_FOUND' }
            });
        }

        return Blog
    }

    


}

export default BlogServices