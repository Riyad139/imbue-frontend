/* eslint-disable no-console */
import { SignerResult } from '@polkadot/api/types';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { WalletAccount } from '@talismn/connect-wallets';
import bcrypt from 'bcryptjs';
import Image from 'next/image';
import React from 'react';
import { useState } from 'react';

import * as utils from '@/utils';

import AccountChoice from '@/components/AccountChoice';
import Login from '@/components/Login';

import { walletIcon } from '@/assets/svgs';
import { postAPIHeaders } from '@/config';
import * as config from '@/config';
import { authorise, getAccountAndSign } from '@/redux/services/polkadotService';

const Join = (): JSX.Element => {
  const [user, setUser] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [matchPassword, setMatchPassword] = useState('');
  const [error, setError] = useState('');

  const [visible, setVisible] = useState<boolean>(false);
  const [polkadotAccountsVisible, showPolkadotAccounts] = useState(false);

  const salt = bcrypt.genSaltSync(10);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const hashedPassword = bcrypt.hashSync(password, salt);

    const body = {
      username: user,
      email: email,
      password: hashedPassword,
    };

    const resp = await fetch(`/api/auth/register`, {
      headers: postAPIHeaders,
      method: 'post',
      body: JSON.stringify(body),
    });

    if (resp.ok) {
      await utils.redirectBack();
    } else {
      const error = await resp.json();
      setError(error);
    }
  };

  const closeModal = (): void => {
    showPolkadotAccounts(true);
  };

  const accountSelected = async (account: WalletAccount): Promise<any> => {
    try {
      const result = await getAccountAndSign(account);
      const resp = await authorise(
        result?.signature as SignerResult,
        result?.challenge as string,
        account
      );
      if (resp.ok) {
        utils.redirect('/dashboard');
      }
    } catch (error) {
      // FIXME: error handling
      console.log(error);
    }
  };

  const googleLogin = async (response: any) => {
    const resp = await fetch(`${config.apiBase}auth/google/`, {
      headers: postAPIHeaders,
      method: 'post',
      body: JSON.stringify(response),
    });

    if (resp.ok) {
      utils.redirect('/dashboard');
    } else {
      setError('incorrect username or password');
    }
  };

  return (
    <div>
      <div
        id='registration-form'
        className='registration-container bg-white w-[70%] py-5 -mt-3 rounded-2xl mx-auto'
      >
        <div className='flex flex-col w-[75%] justify-center items-center mx-auto'>
          <div className='flex flex-col gap-4'>
            <h1>Create account with imbue</h1>
            <p className='text-imbue-purple-dark text-center text-xl'>
              Please use the link below to sign in
            </p>
          </div>

          {/* <div className='flex flex-wrap flex-row justify-center'>
            <CssTextField
              value={user}
              onChange={(e: any) => setUser(e.target.value)}
              id='username'
              type='text'
              label='Username'
              className='mdc-text-field !rounded-[10px] !w-[70%]'
              required
            />
          </div>

          <div className='flex flex-wrap flex-row justify-center'>
            <CssTextField
              type='email'
              label='Email'
              onChange={(e: any) => setEmail(e.target.value)}
              className='mdc-text-field  !rounded-[10px] !w-[70%]'
              required
            />
          </div>
          <div className='flex flex-wrap flex-row justify-center'>
            <CssTextField
              label='Password'
              helperText='Min 8 chars, at least one uppercase, lowercase, number and one special character'
              onChange={(e: any) => setPassword(e.target.value)}
              type='password'
              className='mdc-text-field !rounded-[10px] !w-[70%]'
              required
            />
          </div>

          <div className='flex flex-wrap flex-row justify-center'>
            <CssTextField
              label='Confirm Password'
              error={matchPassword.length > 0 && password != matchPassword}
              onChange={(e: any) => setMatchPassword(e.target.value)}
              helperText={
                password != matchPassword ? 'Please match password' : ''
              }
              type='password'
              className='mdc-text-field  !rounded-[10px] !w-[70%]'
              required
            />
          </div> */}

          <div className='w-full max-w-[50%] mx-auto mt-3'>
            <form
              id='contribution-submission-form'
              name='contribution-submission-form'
              method='get'
              onSubmit={handleSubmit}
              className='w-full'
            >
              <div className='flex flex-col justify-center pb-[10px] w-full mt-2'>
                <label className='font-Aeonik text-base lg:text-[1.25rem] text-imbue-purple-dark font-normal mb-2'>
                  Username
                </label>

                <input
                  placeholder='Enter your Username'
                  onChange={(e: any) => setUser(e.target.value)}
                  required
                  className='outlinedInput'
                />
              </div>

              <div className='flex flex-col justify-center pb-[10px] w-full mt-2'>
                <label className='font-Aeonik text-base lg:text-[1.25rem] text-imbue-purple-dark font-normal mb-2'>
                  Email
                </label>

                <input
                  placeholder='Enter your Email'
                  onChange={(e: any) => setEmail(e.target.value)}
                  className='outlinedInput'
                  required
                  onError={(err) => console.log(err)}
                  type='email'
                />
              </div>

              <div className='flex flex-col justify-center pb-[10px] w-full mt-2'>
                <label className='font-Aeonik text-base lg:text-[1.25rem] text-imbue-purple-dark font-normal mb-2'>
                  Password
                </label>

                <input
                  placeholder='Enter your Password'
                  onChange={(e: any) => setPassword(e.target.value)}
                  className='outlinedInput'
                  required
                  type='password'
                />
              </div>

              <div className='flex flex-col justify-center pb-[10px] w-full mt-2'>
                <label className='font-Aeonik text-base lg:text-[1.25rem] text-imbue-purple-dark font-normal mb-2'>
                  Confirm Password
                </label>

                <input
                  placeholder='Confirm your Password'
                  onChange={(e: any) => setMatchPassword(e.target.value)}
                  className='outlinedInput'
                  required
                  type='password'
                />
              </div>

              <div className='flex flex-wrap flex-row justify-center'>
                <span className={!error ? 'hide' : 'error'}>{error}</span>
              </div>
              <div className='flex justify-center mt-2 w-full'>
                <input
                  type='submit'
                  disabled={password != matchPassword}
                  className='primary-btn in-dark confirm w-full !text-center'
                  id='create-account'
                  value={'Sign Up'}
                />
              </div>

              <div className='mx-auto w-fit mt-5'>
                <span className='text-imbue-purple-dark text-base'>
                  Already have an account?
                </span>
                <span
                  onClick={() => {
                    setVisible(true);
                  }}
                  className='signup text-imbue-coral ml-1 hover:underline cursor-pointer'
                >
                  Sign In
                </span>
              </div>

              <div className='w-full my-4 flex justify-between items-center'>
                <span className='h-[1px] w-[40%] bg-[#D9D9D9]' />
                <p className='text-base text-imbue-purple-dark'>or</p>
                <span className='h-[1px] w-[40%] bg-[#D9D9D9]' />
              </div>

              <div className='login flex flex-col justify-center items-center w-full'>
                <GoogleOAuthProvider clientId={config.googleClientId}>
                  <GoogleLogin
                    width={'400'}
                    logo_alignment='center'
                    shape='circle'
                    size='large'
                    useOneTap={true}
                    onSuccess={(creds: any) => googleLogin(creds)}
                    onError={() => {
                      // FIXME: error handling
                      console.log('Login Failed');
                    }}
                  />
                </GoogleOAuthProvider>
              </div>
            </form>
            <div
              onClick={() => closeModal()}
              className='login justify-center items-center w-full flex flex-col cursor-pointer'
            >
              <button className='h-[2.6rem] rounded-[1.56rem] border border-imbue-purple-dark w-full justify-center bg-[#E1DDFF]'>
                <div className='flex text-imbue-purple-dark text-base justify-center items-center'>
                  <Image
                    src={walletIcon}
                    alt='Wallet-icon'
                    className='relative right-2'
                  />
                  Sign in with a wallet
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <AccountChoice
        accountSelected={(account: WalletAccount) => accountSelected(account)}
        visible={polkadotAccountsVisible}
        setVisible={showPolkadotAccounts}
      />

      <Login
        visible={visible}
        setVisible={setVisible}
        redirectUrl='/dashboard'
      />
    </div>
  );
};

export default Join;
