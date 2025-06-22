const path = require('path');
const fs = require('fs');
const ErrorResponse = require('../utils/errorResponse');

// exports.uploadProfileImage = async (req, res, next) => {
//   try {
//     if (!req.files || !req.files.profileImage) {
//       return next();
//     }

//     const file = req.files.profileImage;

//     if (!file.mimetype.startsWith('image')) {
//       return next(new ErrorResponse('Please upload an image file', 400));
//     }

//     if (file.size > 1000000) {
//       return next(new ErrorResponse('Please upload an image less than 1MB', 400));
//     }

//     file.name = `profile_${req.user.id}${path.parse(file.name).ext}`;

//     file.mv(`./uploads/profiles/${file.name}`, async err => {
//       if (err) {
//         console.error(err);
//         return next(new ErrorResponse('Problem with file upload', 500));
//       }

//       req.body.profileImage = file.name;
//       next();
//     });
//   } catch (error) {
//     next(error);
//   }
// };


exports.uploadProfileImage = async (req, res, next) => {
  try {
    if (!req.files || !req.files.profileImage) {
      return next();
    }

    const file = req.files.profileImage;

    if (!file.mimetype.startsWith('image')) {
      return next(new ErrorResponse('Please upload an image file', 400));
    }

    if (file.size > 1000000) {
      return next(new ErrorResponse('Please upload an image less than 1MB', 400));
    }

    const uploadPath = './public/profiles';
    const ext = path.parse(file.name).ext;
    const fileName = `profile_${req.user.id}${ext}`;
    const filePath = `${uploadPath}/${file.name}`;

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    file.mv(filePath, async err => {
      if (err) {
        console.error(err);
        return next(new ErrorResponse('Problem with file upload', 500));
      }

      req.body.profileImage = file.name;
      next();
    });
  } catch (error) {
    next(error);
  }
};

exports.uploadResume = async (req, res, next) => {
  try {
    if (!req.files || !req.files.resume) {
      return next();
    }

    const file = req.files.resume;

    if (!file.mimetype.startsWith('application/pdf')) {
      return next(new ErrorResponse('Please upload a PDF file', 400));
    }

    if (file.size > 2000000) {
      return next(new ErrorResponse('Please upload a file less than 2MB', 400));
    }

    const uploadPath = './public/resumes';
    const ext = path.parse(file.name).ext;
    const fileName = `${file.name}${ext}`;
    const filePath = `${uploadPath}/${file.name}`;

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    file.mv(filePath, async err => {
      if (err) {
        console.error(err);
        return next(new ErrorResponse('Problem with file upload', 500));
      }

      req.body.resume = file.name;
      next();
    });

  } catch (error) {
    next(error);
  }
};

exports.uploadLeaveDocument = async (req, res, next) => {
  try {
    if (!req.files || !req.files.document) {
      return next();
    }

    const file = req.files.document;

    if (!file.mimetype.startsWith('application/pdf')) {
      return next(new ErrorResponse('Please upload a PDF file', 400));
    }

    if (file.size > 5000000) {
      return next(new ErrorResponse('Please upload a file less than 5MB', 400));
    }

    file.name = `leave_doc_${Date.now()}${path.parse(file.name).ext}`;

    file.mv(`./public/documents/${file.name}`, async err => {
      if (err) {
        console.error(err);
        return next(new ErrorResponse('Problem with file upload', 500));
      }

      req.body.document = file.name;
      next();
    });
  } catch (error) {
    next(error);
  }
};




async function uploadFile(object) {
  return new Promise((resolve, reject) => {
    var obj = object.file;
    var name = Date.now() + obj.name;
    obj.mv(object.path + "/" + name, function (err) {
      if (err) {
        console.log(err)
        reject(err);
      }
      resolve(name);
    });
  });
}

exports.uploadMedia = async (req, res) => {
  try {
    if (!req.files.media || !req.body.path) {
      return utils.handleError(res, {
        message: "MEDIA OR PATH MISSING",
        code: 400,
      });
    }

    let isArray = req.body.isArray;
    let supportedImageTypes = ["image/png", "image/jpeg", "image/jpg", "image/avif", "image/webp", "image/svg", "image/bmp"];
    let supportedOtherTypes = [
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/pdf",
      "audio/mpeg",
      "audio/wav",
      "audio/mp3",
      "audio/ogg",
      "video/mp4",
      "video/quicktime",
      "video/x-m4v",
      "video/webm",
      "video/mov"
    ];

    if (Array.isArray(req.files.media)) {
      let mediaArray = [];
      for (let index = 0; index < req.files.media.length; index++) {
        const element = req.files.media[index];
        console.log("element:", element);
        console.log("type:", element.mimetype);

        if (supportedImageTypes.includes(element.mimetype)) {
          let media = await utils.uploadImage({
            file: element,
            path: `${process.env.STORAGE_PATH}/${req.body.path}`,
          });
          mediaArray.push(`${req.body.path}/${media}`);
        } else if (supportedOtherTypes.includes(element.mimetype)) {
          let media = await uploadFile({
            file: element,
            path: `${process.env.STORAGE_PATH}/${req.body.path}`,
          });
          mediaArray.push(`${req.body.path}/${media}`);
        } else {
          return utils.handleError(res, {
            message: `Unsupported file type: ${element.mimetype}`,
            code: 400,
          });
        }
      }

      return res.status(200).json({
        code: 200,
        data: mediaArray,
      });
    } else {
      const element = req.files.media;
      console.log("element:", element);
      console.log("type:", element.mimetype);

      if (supportedImageTypes.includes(element.mimetype)) {
        let media = await utils.uploadImage({
          file: element,
          path: `${process.env.STORAGE_PATH}/${req.body.path}`,
        });
        const url = `${req.body.path}/${media}`;
        return res.status(200).json({
          code: 200,
          data: isArray === "true" ? [url] : url,
        });
      } else if (supportedOtherTypes.includes(element.mimetype)) {
        let media = await uploadFile({
          file: element,
          path: `${process.env.STORAGE_PATH}/${req.body.path}`,
        });
        const url = `${req.body.path}/${media}`;
        return res.status(200).json({
          code: 200,
          data: isArray === "true" ? [url] : url,
        });
      } else {
        return utils.handleError(res, {
          message: `Unsupported file type: ${element.mimetype}`,
          code: 400,
        });
      }
    }
  } catch (error) {
    console.error("Error:", error);
    utils.handleError(res, error);
  }
};
