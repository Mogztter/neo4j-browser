/*
 * Copyright (c) 2002-2019 "Neo4j,"
 * Neo4j Sweden AB [http://neo4j.com]
 *
 * This file is part of Neo4j.
 *
 * Neo4j is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import './init.js'
import React from 'react'
import ReactDOM from 'react-dom'
import AppInit from './AppInit.jsx'
import neo4j from 'neo4j-driver'
;(async () => {
  try {
    let driver
    let query
    if (window.neo4jGraphOpts && typeof window.neo4jGraphOpts === 'function') {
      const graphOpts = await window.neo4jGraphOpts()
      driver = neo4j.driver(
        graphOpts.uri,
        neo4j.auth.basic(graphOpts.username, graphOpts.password)
      )
      query = graphOpts.query
    } else {
      const uri = 'bolt://localhost:7687'
      const user = 'neo4j'
      const password = 'root'
      driver = neo4j.driver(uri, neo4j.auth.basic(user, password))
      //query = 'MATCH (ee:Person)-[:KNOWS]-(friends) WHERE ee.name = "Emil" RETURN ee, friends'
      query =
        'MATCH (bacon:Person {name:"Kevin Bacon"})-[*1..2]-(hollywood) RETURN DISTINCT hollywood'
    }
    const session = driver.session()
    const result = await session.run(query)
    session.close()
    ReactDOM.render(
      <AppInit result={result} driver={driver} />,
      document.getElementById('mount')
    )
  } catch (err) {
    console.log('Unable to start the application', err)
  }
})()
