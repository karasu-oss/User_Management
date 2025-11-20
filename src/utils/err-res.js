export const catchError = (code, err, res) => {
    return res.status(code).json({
      statusCode: code,
      message: err,
    });
  };
  