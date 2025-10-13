import "bootstrap/dist/css/bootstrap.min.css";

const Welcome = () => {
  return (
    <div className=" page-background container-fluid">
      <div className="text-light p-2 text-center">
      <h1 className="">
        Welcome to Art Share
      </h1>
      </div>
      <div className="row justify-content-center">
        <div className="text-light m-4 div1 p-5 col-md-12">
          <p>
            {" "}
            <b>
              {" "}
              <i>Welcome to Art share</i> —share your art with the world!
              Whether you're an aspiring artist or a seasoned creator, our
              platform provides a supportive community where you can showcase, also gain
              inspiration, and connect with fellow art enthusiasts. Join us today
              and let your creativity shine!
            </b>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
