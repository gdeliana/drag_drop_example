import React, { useContext, useState, useEffect } from "react";
import { hot } from "react-hot-loader";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  Container,
  Col,
  Row,
  Table,
  Button,
  Modal,
  Accordion,
  Card,
} from "react-bootstrap";
import {
  Trash as TrashIcon,
  Justify as JustifyIcon,
} from "react-bootstrap-icons";
import getJsonRenderer from "./tools/getJsonRenderer";
import saveJsonRenderer from "./tools/saveJsonRenderer";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const statistics_default: {
  count_events?: any;
  min_interaction?: number;
  max_interaction?: number;
  mean_interaction?: number;
  sum_interaction?: number;
  max_total_time_input_following?: number;
} = {};

const droppableId = "draggable-list";

const App = () => {
  const [items, setItems] = useState([]);

  const [show, setShow] = useState(false);

  const [statistics, setStatistics] = useState(statistics_default);

  const deleteItem = (k: number) => {
    const items_clone = [...items];
    items_clone.splice(k, 1);
    setItems(items_clone);
  };

  const showModal = () => {
    if (Object.keys(statistics).length == 0) {
      let count_events: {
        [k: string]: number;
      } = {};

      let old_time = 0;

      let min_interaction = Number.MAX_VALUE;

      let max_interaction = 0;

      let sum_interaction = 0;

      let number_interactions = 0;

      let first_time = 0;

      let last_time = 0;

      let prev_item_type = null;

      let total_time_input_following = 0;

      let max_total_time_input_following = 0;

      for (let i in items) {
        let item = items[i];
        let item_type = item.event.type;

        let new_time = item.time;

        if (new_time > 0) {
          if (number_interactions > 0) {
            let interaction_time = new_time - old_time;

            if (interaction_time > max_interaction)
              max_interaction = interaction_time;

            if (interaction_time < min_interaction)
              min_interaction = interaction_time;

            //prev type input means that the new time is the end time for the prev operation
            if (prev_item_type == "input") {
              total_time_input_following =
                total_time_input_following + interaction_time;
            } else {
              // if the prev type wasn't input, we zero the timer and assign it to the max timer if bigger
              if (total_time_input_following > max_total_time_input_following)
                max_total_time_input_following = total_time_input_following;

              total_time_input_following = 0;
            }
          }

          if (first_time == 0) first_time = new_time;

          last_time = new_time;

          old_time = new_time;

          prev_item_type = item_type;

          number_interactions = number_interactions + 1;
        }

        if (item_type) {
          if (!count_events[item_type]) {
            count_events[item_type] = 1;
          } else {
            count_events[item_type] = count_events[item_type] + 1;
          }
        }
      }

      if (min_interaction == Number.MAX_VALUE) min_interaction = 0;

      sum_interaction = last_time - first_time;

      setStatistics({
        count_events,
        min_interaction,
        max_interaction,
        sum_interaction,
        mean_interaction: Math.ceil(sum_interaction / number_interactions),
        max_total_time_input_following,
      });
    }

    setShow(true);
  };

  useEffect(() => {
    (async function () {
      try {
        let r = await getJsonRenderer();
        if (r.records) setItems(r.records);
      } catch (e) {
        console.log(e);
      }
    })();
  }, []);


  const onDragEnd = (result:any) => {
	  
	  // return if item was dropped outside
	  if (!result.destination) return;

	  // return if the item was dropped in the same place
	  if (result.source.droppableId === result.destination.droppableId && result.source.index === result.destination.index) return;
	  
	  // get the items array
	  const newItems = [...items];
	  
	  // get the draggedItems
	  const draggedItem = newItems[result.source.index];
	  
	  // delete the item from source position and insert it to the destination positon
	  newItems.splice(result.source.index, 1);
	  newItems.splice(result.destination.index, 0, draggedItem);
	  
	  // update state
	  setItems(newItems);
	
	};
  



  return (
    <Container fluid>
      {show && (
        <Modal show={show} onHide={() => setShow(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Statistics</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Accordion defaultActiveKey="0">
              <Card>
                <Card.Header>
                  <Accordion.Toggle as={Button} variant="info" eventKey="0">
                    Event counts
                  </Accordion.Toggle>
                </Card.Header>
                <Accordion.Collapse eventKey="0">
                  <Card.Body>
                    {statistics.count_events &&
                      Object.keys(statistics.count_events).map(
                        (event_name: string, k: any) => (
                          <p key={k}>
                            {event_name}:&nbsp;
                            {statistics.count_events[event_name]}
                          </p>
                        )
                      )}
                  </Card.Body>
                </Accordion.Collapse>
              </Card>
              <Card>
                <Card.Header>
                  <Accordion.Toggle as={Button} variant="info" eventKey="1">
                    Other statistics
                  </Accordion.Toggle>
                </Card.Header>
                <Accordion.Collapse eventKey="1">
                  <Card.Body>
                    <p>Min interaction time: {statistics.min_interaction}</p>
                    <p>Max interaction time: {statistics.max_interaction}</p>
                    <p>Mean interaction time: {statistics.mean_interaction}</p>
                    <p>Sum of all interactions: {statistics.sum_interaction}</p>
                    <p>
                      Max time of following input types:{" "}
                      {statistics.max_total_time_input_following}
                    </p>
                  </Card.Body>
                </Accordion.Collapse>
              </Card>
            </Accordion>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShow(false)}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      <Row>
        <Button
          onClick={() => {
            saveJsonRenderer({
              records: [...items],
            });
          }}
        >
          Save JSON
        </Button>
        &nbsp;
        <Button onClick={showModal}>Show statistics</Button>
      </Row>
      <Row>
        <DragDropContext onDragEnd={onDragEnd}>
          <Table style={{
				 tableLayout: 'auto'
			 }}>
            <thead>
              <tr>
                <th>Event type</th>
                <th>Tag name</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <Droppable droppableId={droppableId} type="task">
              {(provided_droppable) => {
						return (
						<tbody
							{...provided_droppable.droppableProps}
							ref={provided_droppable.innerRef}
						>
							{items.map((item: any, k: number) => (
								<Draggable key={String(item.time)} draggableId={String(item.time)} index={k} >
									{(provided_draggable) => {
										return (
											<tr 
											ref={provided_draggable.innerRef}
											{...provided_draggable.draggableProps}
											{...provided_draggable.dragHandleProps}
											>
												<td>{item.event.type}</td>
												<td>{item.setup.url || item.event.type}</td>
												<td>{new Date(item.time).toLocaleString()}</td>
												<td>
													<Button
													onClick={() => {
														deleteItem(k);
													}}
													variant="danger"
													>
													<TrashIcon />
													</Button>
												</td>
											</tr>
										)
									}}
							</Draggable>
							))}
							{provided_droppable.placeholder}
							</tbody>
              		)
				  	}}
            </Droppable>
          </Table>
        </DragDropContext>
      </Row>
    </Container>
  );
};

export default hot(module)(App);
