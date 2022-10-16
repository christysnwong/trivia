import { useState, useContext } from "react";
import UserContext from "../common/UserContext";
import { NavLink as RRNavLink} from "react-router-dom";

import {
  Collapse,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from "reactstrap";

import "./NaviBar.css";

const NaviBar = ({ logout }) => {
  const { currUser } = useContext(UserContext);
  console.debug("Navibar - currUser", currUser);

  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(!isOpen);

  const userLinks = () => {
    return (
      <>
        <UncontrolledDropdown nav inNavbar>
          <DropdownToggle nav caret>
            My Dashboard
          </DropdownToggle>
          <DropdownMenu end>
            <DropdownItem header>
              <i className="fa-solid fa-star me-2"></i>
              {currUser.username} - Level {currUser.stats.level}{" "}
              {currUser.stats.title}
            </DropdownItem>
            <DropdownItem divider />
            <DropdownItem>
              <NavItem>
                <NavLink to="/profile" activeClassName="active" tag={RRNavLink}>
                  Profile
                </NavLink>
              </NavItem>
            </DropdownItem>
            <DropdownItem>
              <NavItem>
                <NavLink to="/stats" activeClassName="active" tag={RRNavLink}>
                  Statistics / Badges
                </NavLink>
              </NavItem>
            </DropdownItem>
            <DropdownItem>
              <NavItem>
                <NavLink
                  to="/personalbest"
                  activeClassName="active"
                  tag={RRNavLink}
                >
                  Personal Best Scores
                </NavLink>
              </NavItem>
            </DropdownItem>
            <DropdownItem>
              <NavItem>
                <NavLink
                  to="/sessions"
                  activeClassName="active"
                  tag={RRNavLink}
                >
                  Recent Played Sessions
                </NavLink>
              </NavItem>
            </DropdownItem>
          </DropdownMenu>
        </UncontrolledDropdown>
        <NavItem>
          <NavLink to="/favourites" activeClassName="active" tag={RRNavLink}>
            My Favourites
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            to="/logout"
            activeClassName="active"
            tag={RRNavLink}
            onClick={logout}
          >
            Log out
          </NavLink>
        </NavItem>
      </>
    );
  };

  const visitorLinks = () => {
    return (
      <>
        <NavItem>
          <NavLink to="/login" activeClassName="active" tag={RRNavLink}>
            Login
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink to="/signup" activeClassName="active" tag={RRNavLink}>
            Sign Up
          </NavLink>
        </NavItem>
      </>
    );
  };

  return (
    <Navbar expand="md" className="bg-sunset" container>
      <NavbarBrand href="/" className="brand">
        <img alt="logo" src="/brain.png" />
        Trivia Guru
      </NavbarBrand>

      <NavbarToggler onClick={toggle} />
      <Collapse isOpen={isOpen} navbar>
        <Nav className="me-auto" navbar>
          <NavItem>
            <NavLink to="/quizzes/" activeClassName="active" tag={RRNavLink}>
              Quizzes
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink to="/leaderboard" activeClassName="active" tag={RRNavLink}>
              Leaderboard
            </NavLink>
          </NavItem>
        </Nav>
        <Nav navbar>{currUser == null ? visitorLinks() : userLinks()}</Nav>
      </Collapse>
      {/* </div> */}
    </Navbar>
  );
};

export default NaviBar;
