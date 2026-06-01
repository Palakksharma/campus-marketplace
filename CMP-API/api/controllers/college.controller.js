
import { College } from "../model/college.schema.js";
import { Auth } from "../model/auth.schema.js";

export const createCollege = async (req, res, next) => {
    try {
        const { collegeName, address } = req.body;

        // 1. Validate input
        if (!collegeName || !address) {
            return res.status(400).json({
                message: "All fields are required",
            });
        }

        
        const isAdminExist = await College.findOne({ admin: req.user.id });
        if (isAdminExist) {
            return res.status(400).json({
                message: "Admin can create only one college",
            });
        }

        const isCollegeExist = await College.findOne({ collegeName: collegeName });
        if (isCollegeExist) {
            return res.status(400).json({
                message: "College already exists",
            });
        }

        
        const college = await College.create({
            collegeName,
            address,
            admin: req.user.id,
        });

        // Link the college to the admin user
        await Auth.findByIdAndUpdate(req.user.id, { college: college._id });

        return res.status(201).json({
            message: "college created successfully",
            college: college,
        });

    } catch (err) {
        return res.status(500).json({
            message: err.message,
        });
    }
};
export const getallColleges = async(req , res, next) =>{
   try {
    const colleges = await College.find({});
    if( !colleges || colleges.length === 0 ) {
        return res.status(400).json({
            message: "No college found",
        })
    }
    return res.status(200).json({
        data:colleges,
    });


   } catch (error) {
    return res.status(500).json({
        message: err.message,
    });
   }
};
