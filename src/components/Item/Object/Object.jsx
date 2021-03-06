import React from 'react';
import { Helmet } from 'react-helmet';

import PropTypes from 'prop-types';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Spinner from 'react-bootstrap/Spinner';
import ListGroup from 'react-bootstrap/ListGroup';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Image from 'react-bootstrap/Image';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

import axios from 'axios';

import Config from '../../../museum.config';
import ShareToolbar from '../ShareToolbar';
import PersonLink from '../PersonLink';
import ObjectRow from '../ObjectRow';

import { Deserializer } from 'jsonapi-serializer';

import { Splide, SplideSlide } from '@splidejs/react-splide';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCube,
  faFingerprint,
  faMapMarkerAlt,
  faMapMarkedAlt,
  faUser,
  faUsers,
  faExternalLinkAlt,
  faCalendarAlt,
  faSave
} from '@fortawesome/free-solid-svg-icons';

import { Link, withRouter } from 'react-router-dom';

import ImagePreloader from '../../../imagePreloader';

const ObjectDeserializer = new Deserializer({keyForAttribute: 'camelCase'});

/**
 * React component for displaying object page content to the user. 
 * 
 * Includes a carousel and links to relevant pages.
 */
class ObjectPage extends React.Component {
  static propTypes = {
    match: PropTypes.object.isRequired
  };

  /**
   * Options for the primary Splide carousel.
   *
   * @member
   * @static
   */
  static primaryOptions = {
    type: 'loop',
    fixedHeight: 300,
    perPage: 1,
    perMove: 1,
    gap: '1rem',
    pagination: false,
    padding: {
      left: 'auto',
      right: 'auto'
    }
  };

  /**
   * Options for the secondary Splide carousel.
   * 
   * @member
   * @static
   */
  static secondaryOptions = {
    type: 'slide',
    rewind: true,
    gap: '1rem',
    pagination: false,
    fixedWidth: 110,
    fixedHeight: 70,
    cover: true,
    focus: 'center',
    isNavigation: true,
    updateOnMove: true,
    arrows: false
  };


  /**
   * Create an object page component.
   * 
   * @param {Object} props The props object for this component instance.
   */
  constructor(props) {
    super(props);

    this.state = {
      /** The museum object data */
      object: null,
      /** The object images preloaded */
      images: null,

      /** Related museum object data */
      relatedObjects: null,

      /** Image modal visibility state */
      imageModal: false,
      /** Image modal image src */
      imageModalSrc: null
    };

    this.primarySplideRef = React.createRef();
    this.secondarySplideRef = React.createRef();

    this.handleCloseImageModal = this.handleCloseImageModal.bind(this);
    this.handleOpenImageModal = this.handleOpenImageModal.bind(this);
  }

  /**
   * Requests object details from API once the component has been mounted into
   * the application.
   */
  componentDidMount() {
    this.requestObjectDetails();
  }

  /**
   * Clears the object state when user switches to view a different museum
   * object.
   *
   * If the object ID has change then the state is reset and new object details
   * are requested using {@link ObjectPage#requestObjectDetails}.
   *
   * @param {Object} prevProps Props of component in previous state.
   * @param {Object} prevState State of component in previous state.
   */
  componentDidUpdate(prevProps, prevState) {
    if(prevProps.match.params.objectId !== this.props.match.params.objectId) {
      this.setState({ 
        object: null,
        images: null,
        relatedObjects: null
      });
      this.requestObjectDetails();
    }

    if(prevState.object === null && this.state.object !== null && this.state.images.length > 0) {
      this.primarySplideRef.current.sync(this.secondarySplideRef.current.splide);
    }
  }

  /**
   * Retrieves the object ID from the router match object (comes from URL bar)
   * and initiates a request to the API for object data using axios.
   */
  requestObjectDetails() {
    const objectId = this.props.match.params.objectId;
    
    axios.get(`/object/${objectId}`, { baseURL: Config.api.base })
      .then(this.onRequestObjectDetailsResponse.bind(this));
  }

  /**
   * Handles raw response from the API. 
   * 
   * 1. Deserializes the JSON string.
   * 2. Starts pre-loading the images into browser.
   * 3. Updates the state of the component.
   * 
   * @param {string} resp Raw response from API.
   */
  onRequestObjectDetailsResponse(resp) {
    ObjectDeserializer.deserialize(resp.data).then((object) => {
      const imageUrls = object.collectionsObjectImages.map((image, index) => 
        new URL(`image/${object.id}/${index}`, Config.api.base));

      new ImagePreloader().load(imageUrls)
        .then((images) => {
          ObjectDeserializer.deserialize(resp.data.meta.relatedObjects).then((objects) => 
            this.setState({
              object: object,
              images: images,
              relatedObjects: objects
            }));
        });
    });
  }

  /**
   * Handle close image modal state.
   */
  handleCloseImageModal() {
    this.setState({
      imageModal: false
    });
  }

  /**
   * Handle open image modal state.
   * 
   * @param {event} e Event arguments.
   */
  handleOpenImageModal(e) {
    this.setState({
      imageModal: true,
      imageModalSrc: e.target.src
    });
  }

  /**
   * Renders object page.
   * 
   * @returns {ReactNode} The react node to render.
   */
  render() {
    if(this.state.object === null) {
      return (
        <div className='d-flex justify-content-center'>
          <Spinner animation='border' variant='dark' />
        </div>);
    }
    return (
      <>
        <Helmet>
          <title>{`${this.state.object.name} - ${Config.site.name}`}</title>
        </Helmet>
        <Modal 
          show={this.state.imageModal} 
          onHide={this.handleCloseImageModal} 
          animation={false} 
          size='xl'>
          <Modal.Header closeButton>
            <OverlayTrigger
              placement='bottom'
              overlay={<Tooltip>Save Image</Tooltip>}>
              <Button 
                variant='outline-secondary' 
                size='sm' 
                href={this.state.imageModalSrc} 
                download='image.jpg'>
                <FontAwesomeIcon icon={faSave} />
              </Button>
            </OverlayTrigger>
          </Modal.Header>
          <Modal.Body>
            <Image 
              src={this.state.imageModalSrc} 
              onClick={this.handleCloseImageModal} 
              style={{cursor: 'zoom-out'}} 
              fluid />
          </Modal.Body>
        </Modal>
        <Row className='mb-4'>
          <Col md={4} lg={3} className='sidebar'>
            <Card className='mb-2'>
              <Card.Header>
                <FontAwesomeIcon icon={faFingerprint}/> Accession No.
              </Card.Header>
              <Card.Body>
                <pre className='m-0'>{this.state.object.accession}</pre>
              </Card.Body>
            </Card>
            <Card className='mb-2'>
              <Card.Header>
                <FontAwesomeIcon icon={faMapMarkerAlt}/> Displayed at
              </Card.Header>
              <Card.Body>
                {this.state.object.facility === null ? 
                  <p className='text-muted m-0'>This object is not currently on display.</p> : 
                  <p className='m-0'>
                    <Link to={`/search?facility=${this.state.object.facility.id}`}>
                      {this.state.object.facility.name}
                    </Link>
                  </p>}
              </Card.Body>
            </Card>
            {this.state.object.creationEarliest &&
            <Card className='mb-2'>
              <Card.Header><FontAwesomeIcon icon={faCalendarAlt}/> Lifecycle</Card.Header>
              <Card.Body>
                <p className='m-0'>
                  {this.state.object.creationEarliest && this.state.object.creationLatest && 
                  (this.state.object.creationEarliest !== this.state.object.creationLatest) ?
                    <Link 
                      to={`/search?creation[earliest]=${this.state.object.creationEarliest}
                      &creation[latest]=${this.state.object.creationLatest}`}
                    >
                      {this.state.object.creationEarliest} - {this.state.object.creationLatest}
                    </Link> :
                    <Link 
                      to={`/search?creation[earliest]=${this.state.object.creationEarliest}`}
                    >
                      {this.state.object.creationEarliest}
                    </Link>}
                </p>
              </Card.Body>
            </Card>}
            {this.state.object.collectionsObjectMakers.length > 0 &&
            <Card className='mb-2'>
              <Card.Header><FontAwesomeIcon icon={faUser}/> Made by</Card.Header>
              <ListGroup as='ul' variant='flush' className='m-0'>
                {this.state.object.collectionsObjectMakers.map((person, i) => {
                  return <ListGroup.Item as='li' key={i}>
                    <PersonLink person={person.person}/>
                  </ListGroup.Item>;
                })}
              </ListGroup>
            </Card>}
            {this.state.object.collectionsObjectPeople.length > 0 &&
            <Card className='mb-2'>
              <Card.Header><FontAwesomeIcon icon={faUsers}/> Related people</Card.Header>
              <ListGroup as='ul' variant='flush' className='m-0'>
                {this.state.object.collectionsObjectPeople.map((person, i) => {
                  return <ListGroup.Item as='li' key={i}>
                    <PersonLink person={person.person}/>
                  </ListGroup.Item>;
                })}
              </ListGroup>
            </Card>}
            {this.state.object.collectionsObjectPlaces.length > 0 &&
            <Card className='mb-2'>
              <Card.Header><FontAwesomeIcon icon={faMapMarkedAlt}/> Places of origin</Card.Header>
              <ListGroup as='ul' variant='flush' className='m-0'>
                {this.state.object.collectionsObjectPlaces.map((place, i) => {
                  return <ListGroup.Item as='li' key={i}>
                    {place.place.name}
                  </ListGroup.Item>;
                })}
              </ListGroup>
            </Card>}
          </Col>
          <Col md={8} lg={9}>
            <div className='d-flex justify-content-end'>
              <ShareToolbar object={this.state.object} />
            </div>
            {this.state.images.length > 0 &&
              <Card>
                <Card.Body>
                  <Splide 
                    options={ObjectPage.primaryOptions} 
                    ref={this.primarySplideRef} 
                    className='mb-2'>
                    {this.state.images.map((image, i) => {
                      return <SplideSlide key={i}>
                        <Image 
                          height='100%' 
                          src={image.src} 
                          onClick={this.handleOpenImageModal} 
                          style={{cursor: 'zoom-in'}}/>
                      </SplideSlide>;
                    })}
                  </Splide>
                  <Splide 
                    options={ObjectPage.secondaryOptions} 
                    ref={this.secondarySplideRef}>
                    {this.state.images.map((image, i) => {
                      return <SplideSlide key={i}>
                        <Image height='100%' src={image.src}/>
                      </SplideSlide>;
                    })}
                  </Splide>
                </Card.Body>
              </Card>
            }
            <h2 className='mb-3 mt-3'>
              <FontAwesomeIcon icon={faCube}/> {this.state.object.name}
            </h2>
            <p>From <Link to={`/search?category=${this.state.object.category.id}`}>{this.state.object.category.name}</Link></p>
            <p>{this.state.object.description}</p>
            <a 
              href={this.state.object.collectionsUrl} 
              target='_blank' 
              rel='noreferrer'
            >Source <FontAwesomeIcon icon={faExternalLinkAlt}/></a>
          </Col>
        </Row>
        <Row className='mb-4'>
          <Col xs={12}>
            <Card>
              <Card.Header>Related Objects</Card.Header>
              <Card.Body className='pt-0 pb-0'>
                <ObjectRow objects={this.state.relatedObjects} />
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </>
    );
  }
}

export default withRouter(ObjectPage);