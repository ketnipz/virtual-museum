import React from 'react';
import PropTypes from 'prop-types';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import GridObject from '../Results/Grid/GridObject';

import Config from '../../museum.config';

import { withRouter } from 'react-router-dom';

import ImagePreloader from '../../imagePreloader';

class ObjectRow extends React.Component {
  static propTypes = {
    objects: PropTypes.array.isRequired
  };

  constructor(props) {
    super(props);

    console.log(props.objects);

    this.state = {
      objects: null,
      images: null
    };
  }

  componentDidMount() {
    const imageUrls = this.props.objects.flatMap((object) => 
      object.collectionsObjectImages.map((image, index) => 
        new URL(`image/${object.id}/${index}`, Config.api.base)));
    new ImagePreloader().load(imageUrls)
      .then((images) => {
        this.setState({
          objects: this.props.objects,
          images: images
        });
      });
  }

  render() {
    return (
      <Row xs={1} md={4}>
        {this.state.objects === null ? 
          [...Array(4).keys()].map((x, i) => 
            <Col className='pl-1 pr-1' key={i}>
              <GridObject preload/>
            </Col>)
          : this.state.objects.length === 0 ? 
            <p className='mx-auto text-muted mb-0'>There are no related objects to show.</p> :
            this.state.objects.map((object, index) => 
              <Col className='pl-1 pr-1' key={index}>
                <GridObject object={object} image={this.state.images[index]} />
              </Col>)}
      </Row>
    );
  }
}

export default withRouter(ObjectRow);