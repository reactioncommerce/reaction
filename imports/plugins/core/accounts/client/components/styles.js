import styled from "styled-components";

export const StyledAuth = styled.div`
  @import url("https://fonts.googleapis.com/css?family=Roboto&display=swap");

  * {
    font-family: 'Roboto', sans-serif!important;
  }

  .idp-form {
    margin: 0 20px;
  }

  .loginForm-title {
    margin: 0;

    & h2 span  {
      color: #000;
      font-size: 20px;
      font-weight: 600;
    }
  }

  .form-group {
    margin-bottom: 0;

    & label {
      font-size: 14px;
      margin-bottom: 10px;
      text-transform: capitalize;
    }

    & input {
      height: 32px;
      outline: none;
      border-radius: 4px;
      background-color: #ffffff;
      border: solid 1px rgba(0, 0, 0, 0.15);

      &:focus, &:hover {
        border-color: #000;
      }
    }

    @media screen and (max-width: 767px) {
      margint: 0 20px!important;
    };
  }

  .help-block {
    margin: 0!important;
    padding: 0!important;
  }

  .form-group:not(:first-child) label {
    margin-top: 30px!important;
  }

  .form-group .btn-primary {
    height: 40px;
    outline: none;
    border-radius: 4px;
    position: relative;
    margin-bottom: 10px;
    background-color: #000;
    margin-top: 30px!important;

    &:focus, &:active {
      outline: none;
    }
  }

  .flat {
    color: #0472b9;
    font-size: 14px;
    line-height: 1.57;
  }

  .RuiCoreLayout-content-2 {
    margin: 0 20px!important;
  }
`;

export const StyledAuthLink = styled.div`
  display: flex;
  margin: 0 20px;
  font-size: 14px;
  line-height: 1.57;
  align-items: center;
  align-self: flex-end;
  color: rgba(0, 0, 0, 0.65);

  > p {
    margin: 0 10px 0 0;
  }

  a {
    color: #0472b9;
  }
`;
