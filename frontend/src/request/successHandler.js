import { notification } from "antd";
import codeMessage from "@request/codeMessage";

const successHandler = (response, options = { notifyOnSuccess: false, notifyOnFailed: true }) => {
  const { data, status } = response;
  // console.log(data, status);

  if (data) {
    const message = response.data && data.message;
    const successText = message || codeMessage[response.status];

    if (options.notifyOnSuccess) {
      notification.config({
        duration: 3,
      });
      switch (options.type) {
        case "success":
          return notification.success({ 
            message: options.msg ? options.msg : "No message",
            description: successText,
          });

        case "info":
          return notification.info({
            message: options.msg ? options.msg : "No message",
            description: successText,
          });

        default:
          return notification.warning({
            message: options.msg ? options.msg : "No message",
            description: successText,
          });
      }
    }
    
  } else {
    if (status == 204) {
      const successText = codeMessage[response.status];
      if (options.notifyOnFailed) {
        notification.config({
          duration: 3,
        });
        notification.info({
          message: 'Data Deleted',
          description: successText,
        });
      }
    } else {
      const message = response.data && data.message;
      const errorText = message || codeMessage[response.status];
      const { status } = response;
      if (options.notifyOnFailed) {
        notification.config({
          duration: 3,
        });
        notification.error({
          message: `Request error ${status}`,
          description: errorText,
        });
      }
    }
  }
};

export default successHandler;
