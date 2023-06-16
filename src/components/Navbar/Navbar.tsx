import CloseIcon from '@mui/icons-material/Close';
import MenuIcon from '@mui/icons-material/Menu';
import { Avatar, Box, IconButton, Menu, Skeleton, Tooltip } from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

import { getCurrentUser } from '@/utils';

import { appLogo } from '@/assets/svgs';
import { User } from '@/model';
import { getFreelancerProfile } from '@/redux/services/freelancerService';

import MenuItems from './MenuItems';
import Login from '../Login';
import defaultProfile from '../../assets/images/profile-image.png';

function Navbar() {
  const [loginModal, setLoginModal] = useState<boolean>(false);
  const [freelancerProfile, setFreelancerProfile] = useState<any>();
  const [user, setUser] = useState<User>();
  const [loading, setLoading] = useState<boolean>(true)

  const [solidNav, setSolidNav] = useState<boolean>(false);

  const router = useRouter();

  const feedbackLink = "https://pfljr3ser45.typeform.com/to/bv00pviH";

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const [openMenu, setOpenMenu] = useState(false);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    setOpenMenu(Boolean(event.currentTarget));
  };
  const handleClose = () => {
    setAnchorEl(null);
    setOpenMenu(false);
  };

  useEffect(() => {
    const setup = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          const res = await getFreelancerProfile(user.username);
          setFreelancerProfile(res);
          setUser(user);
        }
      } catch (error) {
        console.log(error);
      }
      finally {
        setLoading(false)
      }
    };
    setup();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled: boolean = window.scrollY > 50;
      setSolidNav(isScrolled);
    };

    document.addEventListener('scroll', handleScroll);
    return () => {
      document.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const navigateToPage = () => {
    if (user?.username) {
      router.push('/briefs/new');
    } else {
      setLoginModal(true);
    }
  };

  return (
    <>
      <header
        className={`navBar ${solidNav ? 'bg-theme-black-text' : 'bg-transparent'
          }`}
        id='header-wrapper'
      >
        <div className='text-center w-full bg-primary text-black py-1 text-xs lg:text-sm'>
          Thanks for trying the beta version of Imbue. Please let us know what
          we should work on to make it better! Submit your feedback
          <a
            href={feedbackLink}
            target="_blank"
            className="underline cursor-pointer ml-1"
          >
            here
          </a>
        </div>
        <div
          id='main-header'
          className='flex justify-between items-center px-4 lg:px-8 py-2'
        >
          <h1 className='main-title'>
            <Link href='/'>
              <div id='logo'>
                <Image
                  src={appLogo}
                  alt={'app logo'}
                  className='w-2/3 lg:w-full'
                />
              </div>
            </Link>
          </h1>
          {/* <div className="context-menu" id="context-menu">
            <div className="context-menu-item" onClick={toggleSideBar}>
              <a id="main-menu" className="material-icons">
                &#xe5d2;
              </a>
            </div>
          </div> */}

          <Box
            sx={{ display: 'flex', alignItems: 'center', textAlign: 'center' }}
          >
            <span
              className='mx-1 lg:mx-5 text-xs lg:text-sm hidden lg:inline-block cursor-pointer hover:underline'
              onClick={navigateToPage}
            >
              Submit a Brief
            </span>
            <Link
              className='mx-1 lg:mx-5 text-xs lg:text-sm hidden lg:inline-block cursor-pointer hover:underline'
              href='/briefs/'
            >
              Discover Briefs
            </Link>
            <Link
              className='mx-1 lg:mx-5 text-xs lg:text-sm hidden lg:inline-block cursor-pointer hover:underline'
              href='/freelancers'
            >
              Discover Freelancers
            </Link>
            <Tooltip title='Account settings'>
              {
                loading
                  ? <Skeleton variant="circular" width={40} height={40} />
                  : (
                    <IconButton
                      onClick={(e) => handleClick(e)}
                      size="small"
                      sx={{ ml: 2 }}
                      aria-controls={open ? 'account-menu' : undefined}
                      aria-haspopup='true'
                      aria-expanded={open ? 'true' : undefined}
                    >
                      {user?.username ? (
                        <Avatar className="w-8 h-8 lg:w-10 lg:h-10">
                          <Image
                            src={freelancerProfile?.profile_image || defaultProfile}
                            width={40}
                            height={40}
                            alt='profile'
                          />
                        </Avatar>
                      ) : (
                        <div>
                          {openMenu ? (
                            <CloseIcon htmlColor='white' />
                          ) : (
                            <div onClick={() => setOpenMenu(!openMenu)}>
                              {openMenu ? (
                                <CloseIcon htmlColor="white" />
                              ) : (
                                <MenuIcon htmlColor="white" />
                              )}
                            </div>
                          )}
                        </div>
                      )
                      }
                    </IconButton>
                  )
              }

            </Tooltip>

          </Box>
        </div>
        <Menu
          disableScrollLock={true}
          id='basic-menu'
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          MenuListProps={{
            'aria-labelledby': 'basic-button',
          }}
          className='navBar'
        >
          <MenuItems
            isFreelancer={freelancerProfile?.id ? true : false}
            {...{ user, setLoginModal, handleClose }}
          />
        </Menu>
      </header>
      <Login
        visible={loginModal}
        setVisible={(val: any) => {
          setLoginModal(val);
        }}
        redirectUrl={'/dashboard'}
      />
    </>
  );
}

export default Navbar;