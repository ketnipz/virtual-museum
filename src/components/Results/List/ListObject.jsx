import React from 'react';

import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import { Link } from 'react-router-dom';

import ListContentLoader from '../../ContentLoaders/ListContentLoader';

const ListObject = (props) => {
  if(props.preload) {
    return (
      <Card className="mb-2 mt-2 list-object">
        <Card.Body>
          <ListContentLoader/>
        </Card.Body>
      </Card>
    );
  } else {
    let object = props.object;
    let cardImage;
    if(props.image == undefined) {
      cardImage = (
        <div className='grid-image-wrap'></div>
      );
    } else {
      cardImage = (
        <div className='grid-image-wrap'>
          <Card.Img variant="top" src={props.image.src}></Card.Img>
        </div>
      );
    }

    let dates = '';
    if(object.creationEarliest & !object.creationLatest) {
      dates = `${object.creationEarliest}`;
    } else if(object.creationEarliest && object.creationLatest) {
      dates = `${object.creationEarliest} - ${object.creationLatest}`;
    }
    return (
      <Link to={`/object/${object.id}`} className='list-object'>
        <Card className="mb-2 mt-2">
          <Row>
            <Col className='pr-0' xs={3}>{cardImage}</Col>
            <Col className='pl-0'>
              <Card.Body>
                <Card.Title title={object.name}>{object.name}</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">{object.category.name}</Card.Subtitle>
                <Card.Subtitle className="text-muted">{dates}</Card.Subtitle>
              </Card.Body>
            </Col>
          </Row>
        </Card>
      </Link>
    );
  }
};

export default ListObject;